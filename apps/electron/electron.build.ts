export default {
  appId: 'com.crosscraft.app',
  productName: 'CrossCraft',
  directories: {
    output: 'release',
  },
  files: ['dist/**/*', 'www/**/*', 'package.json'],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    signAndEditExecutable: false,
  },
  nsis: {
    oneClick: false,
  },
  artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
};
