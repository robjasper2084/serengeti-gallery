export const validRoom = value => typeof value === 'string' && /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value);
export const cleanName = value => String(value || 'Visitor').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 24) || 'Visitor';
