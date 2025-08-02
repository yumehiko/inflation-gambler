import React, { useState, useCallback } from 'react';
import styles from './gameSetup.module.css';
import type { GameSetupProps, ParticipantSetup, GameSetupFormData, GameSetupFormErrors } from './gameSetup.types';

export const GameSetup: React.FC<GameSetupProps> = ({
  onStartGame,
  defaultBalance = 1000,
  maxPlayers = 4
}) => {
  const [participants, setParticipants] = useState<ParticipantSetup[]>([]);
  const [formData, setFormData] = useState<GameSetupFormData>({
    name: '',
    balance: defaultBalance.toString(),
    isHuman: true
  });
  const [errors, setErrors] = useState<GameSetupFormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: GameSetupFormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'プレイヤー名を入力してください';
    }
    
    const balanceNum = parseInt(formData.balance, 10);
    if (isNaN(balanceNum) || balanceNum < 1) {
      newErrors.balance = '初期残高は1以上の数値を入力してください';
    }
    
    if (participants.length >= maxPlayers) {
      newErrors.general = '最大プレイヤー数に達しました';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, participants.length, maxPlayers]);

  const handleAddPlayer = useCallback(() => {
    if (!validateForm()) {
      return;
    }
    
    const newParticipant: ParticipantSetup = {
      name: formData.name.trim(),
      balance: parseInt(formData.balance, 10),
      isHuman: formData.isHuman
    };
    
    setParticipants([...participants, newParticipant]);
    setFormData({
      name: '',
      balance: defaultBalance.toString(),
      isHuman: true
    });
    setErrors({});
  }, [formData, participants, validateForm, defaultBalance]);

  const handleRemovePlayer = useCallback((index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
    setErrors({});
  }, [participants]);

  const handleStartGame = useCallback(() => {
    if (participants.length === 0) {
      return;
    }
    onStartGame(participants);
  }, [participants, onStartGame]);

  const handleInputChange = useCallback((field: keyof GameSetupFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
      general: undefined
    }));
  }, []);

  const canAddMore = participants.length < maxPlayers;
  const canStartGame = participants.length > 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ゲームセットアップ</h1>
      
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>プレイヤーを追加</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="playerName" className={styles.label}>
            プレイヤー名
          </label>
          <input
            id="playerName"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={styles.input}
            disabled={!canAddMore}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="playerBalance" className={styles.label}>
            初期残高
          </label>
          <input
            id="playerBalance"
            type="number"
            value={formData.balance}
            onChange={(e) => handleInputChange('balance', e.target.value)}
            className={styles.input}
            min="1"
            disabled={!canAddMore}
          />
          {errors.balance && <span className={styles.error}>{errors.balance}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              id="isHuman"
              type="checkbox"
              checked={formData.isHuman}
              onChange={(e) => handleInputChange('isHuman', e.target.checked)}
              className={styles.checkbox}
              disabled={!canAddMore}
            />
            <span>人間プレイヤー</span>
          </label>
        </div>
        
        {errors.general && <div className={styles.error}>{errors.general}</div>}
        
        <button
          onClick={handleAddPlayer}
          disabled={!canAddMore}
          className={styles.addButton}
        >
          プレイヤーを追加
        </button>
      </div>
      
      <div className={styles.playersSection}>
        <h2 className={styles.sectionTitle}>参加プレイヤー ({participants.length}/{maxPlayers})</h2>
        
        {participants.length === 0 ? (
          <p className={styles.noPlayers}>プレイヤーがまだ追加されていません</p>
        ) : (
          <ul className={styles.playersList}>
            {participants.map((participant, index) => (
              <li key={index} className={styles.playerItem}>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>{participant.name}</span>
                  <span className={styles.playerBalance}>¥{participant.balance.toLocaleString()}</span>
                  <span className={participant.isHuman ? styles.playerType : `${styles.playerType} ${styles.playerTypeAI}`}>{participant.isHuman ? '人間' : 'AI'}</span>
                </div>
                <button
                  onClick={() => handleRemovePlayer(index)}
                  className={styles.removeButton}
                  aria-label={`${participant.name}を削除`}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className={styles.actionSection}>
        <button
          onClick={handleStartGame}
          disabled={!canStartGame}
          className={styles.startButton}
        >
          ゲームを開始
        </button>
      </div>
    </div>
  );
};