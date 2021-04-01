export const pick = (obj, properties) => {
  return Object.keys(obj)
    .filter(key => properties.includes(key))
    .reduce(
      (picked, key) => ({
        ...picked,
        [key]: obj[key]
      }),
      {}
    )
}
