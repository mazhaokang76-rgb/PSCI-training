// services/supabaseService.ts
const SUPABASE_URL = 'https://ngietzlzwskrmnyuqeop.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5naWV0emx6d3Nrcm1ueXVxZW9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI0NjgwOSwiZXhwIjoyMDgwODIyODA5fQ.mICW9lJG8Q1KFrLlFIhlMNdLRroFABTfHw5UHkjfAmc';

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  id_number: string;
  education_years: number;
}

export interface TrainingRecord {
  user_id: string;
  game_id: string;
  game_name: string;
  score: number;
  stars: number;
  level: number;
  details?: any;
}

export interface AssessmentRecord {
  user_id: string;
  assessment_type: 'MMSE' | 'MOCA' | 'ADL';
  score: number;
  max_score: number;
  interpretation: string;
  details?: any;
}

export const supabase = {
  // 用户管理
  async registerUser(user: UserProfile) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(user)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`注册失败: ${error}`);
    }
    return await response.json();
  },

  async loginUser(idNumber: string): Promise<UserProfile | null> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id_number=eq.${idNumber}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (!response.ok) throw new Error('查询失败');
    const users = await response.json();
    return users[0] || null;
  },

  // 训练记录
  async saveTraining(record: TrainingRecord) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/psci_training`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error('保存训练记录失败');
    return await response.json();
  },

  async getTrainingRecords(userId: string) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/psci_training?user_id=eq.${userId}&order=date.desc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (!response.ok) throw new Error('获取训练记录失败');
    return await response.json();
  },

  // 评估记录
  async saveAssessment(record: AssessmentRecord) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/psci_assessment`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error('保存评估记录失败');
    return await response.json();
  },

  async getAssessments(userId: string) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/psci_assessment?user_id=eq.${userId}&order=date.desc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (!response.ok) throw new Error('获取评估记录失败');
    return await response.json();
  }
};
