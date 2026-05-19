const { withAndroidManifest } = require('@expo/config-plugins');

// Adds <queries> to AndroidManifest so Linking.openURL works for WhatsApp and Bit
module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.queries) {
      manifest.queries = [];
    }

    manifest.queries.push({
      package: [
        { $: { 'android:name': 'com.whatsapp' } },
        { $: { 'android:name': 'com.whatsapp.w4b' } },
        { $: { 'android:name': 'com.onyx.bit' } },
      ],
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'https', 'android:host': 'wa.me' } }],
        },
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'bit' } }],
        },
      ],
    });

    return config;
  });
};
