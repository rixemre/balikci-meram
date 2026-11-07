module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['expo-location', {
      locationWhenInUsePermission: 'Balıkçı Meram, bulunduğun yeri mera olarak işaretlemek için konumunu kullanır.',
    }],
    ['expo-image-picker', {
      photosPermission: 'Balıkçı Meram, av kaydına bir fotoğraf ekleyebilmen için fotoğraflarına erişir.',
      cameraPermission: 'Balıkçı Meram, avının fotoğrafını çekebilmen için kameranı kullanır.',
      microphonePermission: false,
    }],
    ...(process.env.GOOGLE_MAPS_ANDROID_API_KEY
      ? [['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }]]
      : []),
  ],
})
