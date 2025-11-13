// Utilidades para el módulo de Votaciones (Firestore v10+ API modular)
// Crea y registra votos dentro de trips/{tripId}/votaciones

import { auth, db } from '../firebase/firebaseConfig'
import { DEV_DEFAULT_TRIP_ID } from '../config/devConfig'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp
} from 'firebase/firestore'

// Convierte distintos formatos de fecha a Firestore Timestamp
function toTimestamp(input) {
  if (!input) return null
  if (input instanceof Date) return Timestamp.fromDate(input)
  if (typeof input === 'string' || typeof input === 'number') {
    const d = new Date(input)
    if (isNaN(d)) throw new Error('Fecha inválida para deadline')
    return Timestamp.fromDate(d)
  }
  // Si ya es un Timestamp (o similar), devolver tal cual
  if (input.seconds != null && input.nanoseconds != null) return input
  throw new Error('Formato de deadline no soportado')
}

// Normaliza y valida el array de opciones
function normalizeOptions(opts) {
  const arr = (opts || [])
    .map(o => (typeof o === 'string' ? o.trim() : ''))
    .filter(Boolean)
  if (arr.length < 2) throw new Error('Debes proporcionar al menos 2 opciones')
  return arr
}

// Crea una votación en trips/{tripId}/votaciones
// data: { title, description, options, deadline }
export async function crearVotacion(tripId, data) {
  const effectiveTripId = tripId || DEV_DEFAULT_TRIP_ID
  if (!effectiveTripId) throw new Error('tripId es requerido')

  // AUTENTICACIÓN: exige sesión real
  const user = auth.currentUser
  if (!user) throw new Error('Usuario no autenticado')

  const { title, description = '', options, deadline } = data || {}
  if (!title || !title.trim()) throw new Error('El título es obligatorio')

  const cleanOptions = normalizeOptions(options)
  const deadlineTs = toTimestamp(deadline)

  const votacionesRef = collection(db, 'trips', String(effectiveTripId), 'votaciones')
  const payload = {
    title: title.trim(),
    description: description?.trim() || '',
    options: cleanOptions,
    deadline: deadlineTs,
    status: 'active',
    createdAt: serverTimestamp(),
    createdBy: user.displayName || user.email || 'Usuario',
    createdByUid: user.uid
  }

  const docRef = await addDoc(votacionesRef, payload)
  return { id: docRef.id, tripId: effectiveTripId, ...payload }
}

// Registra (o actualiza) el voto del usuario en
// trips/{tripId}/votaciones/{votacionId}/votes/{user.uid}
export async function registrarVoto(tripId, votacionId, option) {
  const effectiveTripId = tripId || DEV_DEFAULT_TRIP_ID
  if (!effectiveTripId) throw new Error('tripId es requerido')
  if (!votacionId) throw new Error('votacionId es requerido')
  // AUTENTICACIÓN: exige sesión real
  const user = auth.currentUser
  if (!user) throw new Error('Usuario no autenticado')
  if (!option || !String(option).trim()) throw new Error('La opción es obligatoria')

  const voteRef = doc(db, 'trips', String(effectiveTripId), 'votaciones', String(votacionId), 'votes', user.uid)
  const voteData = {
    userId: user.uid,
    userName: user.displayName || null,
    userEmail: user.email || null,
    userPhotoURL: user.photoURL || null,
    option: String(option).trim(),
    createdAt: serverTimestamp()
  }

  // Usamos setDoc en el doc del usuario para garantizar 1 voto por usuario
  await setDoc(voteRef, voteData, { merge: false })

  // Nota: si quieres llevar contadores/estadísticas agregadas en el doc de la votación,
  // podemos añadir un updateDoc con FieldValue.increment y/o transacción.
  // Se deja simple por ahora para evitar condiciones de carrera.

  return { ok: true }
}
