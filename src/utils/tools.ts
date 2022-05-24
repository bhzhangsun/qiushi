export const format = (pathname: string) => {
  const paths = pathname.split('/')
  return '/' + paths.filter((item) => item).join('/')
}

export const split = (pathname: string) => {
  return pathname.split('/').filter((item) => item)
}

export function guid(format: string = 'xxxxxxxxxxxxxxxx') {
  const charset =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'
  return Array.from(format)
    .map((c) =>
      c == '-' ? c : charset[Math.floor((Math.random() * 100) % charset.length)]
    )
    .join('')
}

export function plat(name: string) {
  if (/ios/i.test(name)) {
    return 'ios'
  } else if (/android/i.test(name)) {
    return 'android'
  } else if (/(windows|mac|osx)/i.test(name)) {
    return 'pc'
  } else {
    return 'unknown'
  }
}
