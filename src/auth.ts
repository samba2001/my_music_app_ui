export function parseJwt(token?: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // atob -> percent-encoding -> decodeURIComponent to support UTF-8
    const json = decodeURIComponent(Array.prototype.map.call(atob(base64), (c: string) => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export function isAdmin(user?: any): boolean {
  if (Array.isArray(user?.roles) && user.roles.includes('admin')) return true
  if (user?.role === 'admin' || user?.is_admin === true) return true
  return false
}

export default { parseJwt, isAdmin }
