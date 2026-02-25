export const isValidEmail  = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export const isValidPhone  = (v) => v.replace(/\D/g, '').length >= 9
export const isValidPostal = (v) => /^\d{4}$/.test(v)
export const isValidCard   = (v) => v.replace(/\s/g, '').length === 16
export const isValidCVV    = (v) => /^\d{3}$/.test(v)

export const isValidExpiry = (v) => {
  if (!/^\d{2}\s*\/\s*\d{2}$/.test(v)) return false
  const [mm, yy] = v.split('/').map(s => parseInt(s.trim()))
  const now = new Date(), nowYY = now.getFullYear() % 100, nowMM = now.getMonth() + 1
  return mm >= 1 && mm <= 12 && (yy > nowYY || (yy === nowYY && mm >= nowMM))
}

export const stripNonAlpha  = (v) => v.replace(/[^a-zA-Z\s\-']/g, '')
export const stripDigits    = (v) => v.replace(/\D/g, '')
export const formatCard     = (v) => v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim()
export const formatExpiry   = (v) => { const d = v.replace(/\D/g, '').substring(0, 4); return d.length >= 2 ? d.substring(0,2) + ' / ' + d.substring(2) : d }
export const fmt            = (n) => 'R' + n.toLocaleString('en-ZA')