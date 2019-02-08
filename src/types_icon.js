import placeholder from './assets/icons/placeholder.jpeg';

export const typesIcon = (type, icon) => {
  switch (type) {
    case type === 'specific type':
      return 'icon of that type'
    default:
      return icon ? icon : placeholder
  }
}
