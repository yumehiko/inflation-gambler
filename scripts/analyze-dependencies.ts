import { Project, SourceFile } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

interface Domain {
  name: string;      // 表示名（例：'blackjack/player'）
  path: string;      // フルパス
}

interface DomainDependency {
  from: string;
  to: string;
  type: 'normal' | 'violation';
  details?: string;
}

interface Violation {
  file: string;
  importPath: string;
  violationType: string;
  line: number;
}

class DependencyAnalyzer {
  private project: Project;
  private domainsPath: string;
  private domains: Map<string, Domain> = new Map();
  private dependencies: DomainDependency[] = [];
  private violations: Violation[] = [];

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
    });
    this.domainsPath = path.join(process.cwd(), 'src', 'domains');
  }

  async analyze() {
    console.log('🔍 分析を開始します...');
    
    // ドメインディレクトリを取得
    const domainsList = this.getDomains();
    
    // ドメインをマップに格納
    domainsList.forEach(domain => {
      this.domains.set(domain.path, domain);
    });
    
    console.log(`📁 ${domainsList.length}個のドメインを発見:`, domainsList.map(d => d.name));

    // 各ドメインのファイルを分析
    for (const domain of domainsList) {
      await this.analyzeDomain(domain);
    }

    // 循環依存を検出
    const cycles = this.detectCycles();
    
    console.log(`\n✅ 分析完了:`);
    console.log(`  - 依存関係: ${this.dependencies.length}件`);
    console.log(`  - 違反: ${this.violations.length}件`);
    console.log(`  - 循環依存: ${cycles.length}件`);

    // 結果を出力
    await this.generateReports(cycles);
  }

  private getDomains(): Domain[] {
    const domains: Domain[] = [];
    
    // 再帰的にディレクトリを探索してドメインを検出
    const exploreDomains = (dirPath: string, prefix: string = '') => {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // ディレクトリ内のファイルをチェック
          const files = fs.readdirSync(itemPath);
          const hasHookOrStore = files.some(file => 
            file.includes('.hook.') || file.includes('.store.')
          );
          
          if (hasHookOrStore) {
            // このディレクトリはドメイン
            const domainName = prefix ? `${prefix}/${item}` : item;
            domains.push({
              name: domainName,
              path: itemPath
            });
          } else {
            // サブディレクトリを探索
            const newPrefix = prefix ? `${prefix}/${item}` : item;
            exploreDomains(itemPath, newPrefix);
          }
        }
      }
    };
    
    exploreDomains(this.domainsPath);
    return domains;
  }

  private async analyzeDomain(domain: Domain) {
    const sourceFiles = this.project.addSourceFilesAtPaths(
      path.join(domain.path, '**/*.{ts,tsx}')
    );

    for (const sourceFile of sourceFiles) {
      this.analyzeSourceFile(sourceFile, domain);
    }
  }

  private analyzeSourceFile(sourceFile: SourceFile, fromDomain: Domain) {
    const filePath = sourceFile.getFilePath();
    
    // テストファイルとStorybookファイルはスキップ
    if (filePath.includes('.test.') || filePath.includes('.stories.')) {
      return;
    }

    const importDeclarations = sourceFile.getImportDeclarations();

    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      // 相対パスのインポートのみを分析
      if (moduleSpecifier.startsWith('../')) {
        this.analyzeImport(filePath, fromDomain, moduleSpecifier, importDecl.getStartLineNumber());
      }
    }
  }

  private analyzeImport(filePath: string, fromDomain: Domain, importPath: string, line: number) {
    // 相対パスを絶対パスに解決
    const fileDir = path.dirname(filePath);
    const resolvedPath = path.resolve(fileDir, importPath);
    
    // 解決されたパスからドメインを特定
    const toDomain = this.findDomainByPath(resolvedPath);
    
    if (!toDomain || toDomain.name === fromDomain.name) {
      // 外部ドメインでないか、同じドメイン内のインポートはスキップ
      return;
    }

    // .store.tsへの直接アクセスをチェック
    const isStoreImport = importPath.includes('.store');
    const fileName = path.basename(filePath);
    const isFromStore = fileName.includes('.store.');
    
    if (isStoreImport && !isFromStore) {
      // 違反：外部ドメインの.storeへの直接アクセス
      this.violations.push({
        file: filePath,
        importPath,
        violationType: '外部ドメインの.store.tsへの直接アクセス',
        line
      });
      
      this.dependencies.push({
        from: fromDomain.name,
        to: toDomain.name,
        type: 'violation',
        details: `.store.tsへの直接アクセス (${fileName})`
      });
    } else {
      // 正常な依存関係
      const existingDep = this.dependencies.find(
        dep => dep.from === fromDomain.name && dep.to === toDomain.name && dep.type === 'normal'
      );
      
      if (!existingDep) {
        this.dependencies.push({
          from: fromDomain.name,
          to: toDomain.name,
          type: 'normal'
        });
      }
    }
  }

  private findDomainByPath(filePath: string): Domain | null {
    // ファイルパスがどのドメインに属するか検索
    for (const [domainPath, domain] of this.domains.entries()) {
      if (filePath.startsWith(domainPath)) {
        return domain;
      }
    }
    return null;
  }

  private async generateReports(cycles: string[][]) {
    // docsディレクトリを作成
    const docsPath = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true });
    }

    // Mermaidダイアグラムを生成
    await this.generateMermaidDiagram(docsPath, cycles);
    
    // 違反レポートを生成
    await this.generateViolationReport(docsPath);
  }

  private async generateMermaidDiagram(docsPath: string, cycles: string[][]) {
    let mermaidContent = `# ドメイン依存関係図

\`\`\`mermaid
graph TD
`;

    // ノードのスタイルを定義
    const domains = new Set<string>();
    this.dependencies.forEach(dep => {
      domains.add(dep.from);
      domains.add(dep.to);
    });

    // 各ドメインのノードを追加
    domains.forEach(domain => {
      const nodeId = this.escapeNodeId(domain);
      mermaidContent += `    ${nodeId}["${domain}"]\n`;
    });

    mermaidContent += '\n';

    // 依存関係の矢印を追加
    this.dependencies.forEach(dep => {
      const fromId = this.escapeNodeId(dep.from);
      const toId = this.escapeNodeId(dep.to);
      if (dep.type === 'normal') {
        mermaidContent += `    ${fromId} --> ${toId}\n`;
      } else {
        mermaidContent += `    ${fromId} -.->|violation| ${toId}\n`;
      }
    });

    // 違反のスタイルを設定
    const violationDomains = new Set<string>();
    this.violations.forEach(v => {
      const fromDomain = this.extractDomainFromPath(v.file);
      if (fromDomain) violationDomains.add(fromDomain);
    });

    if (violationDomains.size > 0) {
      mermaidContent += '\n';
      violationDomains.forEach(domain => {
        const nodeId = this.escapeNodeId(domain);
        mermaidContent += `    style ${nodeId} fill:#ffcccc\n`;
      });
    }

    mermaidContent += `\`\`\`

## 凡例
- 実線の矢印: 正常な依存関係
- 点線の矢印: アーキテクチャルール違反
- 赤色のノード: 違反を含むドメイン

## 統計
- ドメイン数: ${domains.size}
- 依存関係数: ${this.dependencies.filter(d => d.type === 'normal').length}
- 違反数: ${this.violations.length}
- 循環依存: ${cycles.length}
`;

    if (cycles.length > 0) {
      mermaidContent += `\n## 循環依存\n\n`;
      cycles.forEach((cycle, index) => {
        mermaidContent += `${index + 1}. ${cycle.slice(0, -1).join(' → ')} → ${cycle[0]}\n`;
      });
    }

    fs.writeFileSync(path.join(docsPath, 'domain-dependencies.md'), mermaidContent);
    console.log('📊 Mermaidダイアグラムを生成しました: docs/domain-dependencies.md');
  }

  private async generateViolationReport(docsPath: string) {
    if (this.violations.length === 0) {
      const content = `# アーキテクチャ違反レポート

✅ 違反は検出されませんでした。

素晴らしい！すべてのドメインがアーキテクチャルールに従っています。
`;
      fs.writeFileSync(path.join(docsPath, 'violations.md'), content);
      return;
    }

    let content = `# アーキテクチャ違反レポート

⚠️ ${this.violations.length}件の違反が検出されました。

## 違反の詳細

`;

    // 違反をファイルごとにグループ化
    const violationsByFile = new Map<string, Violation[]>();
    this.violations.forEach(v => {
      if (!violationsByFile.has(v.file)) {
        violationsByFile.set(v.file, []);
      }
      violationsByFile.get(v.file)!.push(v);
    });

    violationsByFile.forEach((violations, file) => {
      const relativePath = path.relative(process.cwd(), file);
      content += `### 📄 ${relativePath}\n\n`;
      
      violations.forEach(v => {
        content += `- **行 ${v.line}**: ${v.violationType}\n`;
        content += `  - インポート: \`${v.importPath}\`\n`;
      });
      
      content += '\n';
    });

    content += `## 修正方法

外部ドメインの\`.store.ts\`への直接アクセスを修正するには：

1. 対象ドメインの\`.hook.ts\`からインポートするように変更
2. 必要な関数やステートが\`.hook.ts\`で公開されていない場合は、適切に公開する

例：
\`\`\`typescript
// ❌ 違反
import { useSceneStore } from '../scene/scene.store';

// ✅ 正しい
import { useScene } from '../scene/scene.hook';
\`\`\`
`;

    fs.writeFileSync(path.join(docsPath, 'violations.md'), content);
    console.log('📋 違反レポートを生成しました: docs/violations.md');
  }

  private extractDomainFromPath(filePath: string): string | null {
    const domain = this.findDomainByPath(filePath);
    return domain ? domain.name : null;
  }

  private escapeNodeId(name: string): string {
    // Mermaidの特殊文字をエスケープ
    return name.replace(/[\/\-\.]/g, '_');
  }

  private detectCycles(): string[][] {
    const cycles: string[][] = [];
    const graph = new Map<string, Set<string>>();
    
    // 依存関係グラフを構築
    this.dependencies.forEach(dep => {
      if (dep.type === 'normal') {
        if (!graph.has(dep.from)) {
          graph.set(dep.from, new Set());
        }
        graph.get(dep.from)!.add(dep.to);
      }
    });
    
    // DFSで循環を検出
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];
    
    const dfs = (node: string): void => {
      visited.add(node);
      recursionStack.add(node);
      currentPath.push(node);
      
      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recursionStack.has(neighbor)) {
          // 循環を発見
          const cycleStart = currentPath.indexOf(neighbor);
          const cycle = currentPath.slice(cycleStart);
          cycle.push(neighbor); // 循環を閉じる
          
          // 重複を避けるため、正規化されたサイクルをチェック
          const normalized = this.normalizeCycle(cycle);
          if (!cycles.some(c => this.areCyclesEqual(c, normalized))) {
            cycles.push(normalized);
          }
        }
      }
      
      currentPath.pop();
      recursionStack.delete(node);
    };
    
    // すべてのノードから探索開始
    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
    
    return cycles;
  }
  
  private normalizeCycle(cycle: string[]): string[] {
    // 循環を正規化（辞書順で最小の要素から開始）
    if (cycle.length === 0) return cycle;
    
    const minNode = cycle.reduce((min, node) => node < min ? node : min);
    const minIndex = cycle.indexOf(minNode);
    return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
  }
  
  private areCyclesEqual(cycle1: string[], cycle2: string[]): boolean {
    if (cycle1.length !== cycle2.length) return false;
    return cycle1.every((node, i) => node === cycle2[i]);
  }
}

// メイン実行
async function main() {
  const analyzer = new DependencyAnalyzer();
  await analyzer.analyze();
}

main().catch(console.error);