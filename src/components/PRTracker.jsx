import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Trophy } from 'lucide-react';

export default function PRTracker() {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    exercise: '',
    record_value: '',
    record_unit: 'kg',
    date_achieved: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPRs();
  }, []);

  const fetchPRs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('prs')
      .select('*')
      .eq('user_id', user.id)
      .order('date_achieved', { ascending: false });
    
    if (data) setPrs(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('prs').insert({
      user_id: user.id,
      exercise: formData.exercise,
      record_value: parseFloat(formData.record_value),
      record_unit: formData.record_unit,
      date_achieved: formData.date_achieved
    });

    setFormData({ ...formData, exercise: '', record_value: '' });
    fetchPRs();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="heading-2" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Trophy color="gold" /> Personal Records
      </h2>

      <div className="glass-panel" style={{ marginBottom: '30px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="text-muted">Exercise (e.g. Back Squat, 5K Run)</label>
            <input required type="text" className="input-field" value={formData.exercise} onChange={e => setFormData({...formData, exercise: e.target.value})} />
          </div>
          <div style={{ width: '100px' }}>
            <label className="text-muted">Record</label>
            <input required type="number" step="0.1" className="input-field" value={formData.record_value} onChange={e => setFormData({...formData, record_value: e.target.value})} />
          </div>
          <div style={{ width: '100px' }}>
            <label className="text-muted">Unit</label>
            <select className="input-field" value={formData.record_unit} onChange={e => setFormData({...formData, record_unit: e.target.value})}>
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
              <option value="min">min</option>
            </select>
          </div>
          <div style={{ width: '150px' }}>
            <label className="text-muted">Date</label>
            <input required type="date" className="input-field" value={formData.date_achieved} onChange={e => setFormData({...formData, date_achieved: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>Add PR</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {prs.map(pr => (
          <div key={pr.id} className="glass-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
              <Trophy size={100} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{pr.exercise}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '5px' }}>
              {pr.record_value} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{pr.record_unit}</span>
            </div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>{new Date(pr.date_achieved).toLocaleDateString()}</div>
          </div>
        ))}
        {prs.length === 0 && !loading && <p className="text-muted">No PRs logged yet. Time to set some records!</p>}
      </div>
    </div>
  );
}
