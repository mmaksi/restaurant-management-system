export const createGradientColors = (index: number) => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-indigo-500 to-blue-500',
    'from-rose-500 to-pink-500',
  ];
  return gradients[index % gradients.length];
};
