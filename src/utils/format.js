// Shared formatting helpers for storage/RAM display, previously duplicated
// across PhoneCard, PhoneDetail, and CompareTable.

export function getStorageOptions(phone) {
  return phone.storageOptions?.length
    ? phone.storageOptions
    : [{ ram: phone.ram, storage: phone.storage, price: phone.price }]
}

export function formatStorageOption({ ram, storage }) {
  return `${ram}/${storage >= 1024 ? `${storage / 1024}TB` : `${storage}GB`}`
}

export function formatStorageOptions(phone) {
  return getStorageOptions(phone).map(formatStorageOption).join(' · ')
}