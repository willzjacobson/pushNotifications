const Expo = require('expo-server-sdk');
const db = require('../db');

const dbKey = 'pushNotifications';

const addPushToken = ({ token, platform, timezoneOffset }) => {
  if (!Expo.isExpoPushToken(token)) {
    return Promise.reject(new Error('Invalid token.'));
  }

  return db
    .table(dbKey)
    .where({ token })
    .then(docs => {
      if (docs.length) {
        return Promise.reject(new Error('Push token already registered'));
      } else {
        return db.table(dbKey).insert({
          token,
          platform,
          timezoneOffset,
        });
      }
    });
};

const sendNewNotificationToAll = ({ questions, nextQuestionTime }) => {
  const expo = new Expo();

  return db
    .table(dbKey)
    .then(docs => {
      const messages = [];
      docs.forEach(d => {
        messages.push({
          to: d.token,
          sound: 'default',
          body: questions[0].question,
          badge: questions.length,
        });
      });

      return { messages };
    })
    .then(({ messages }) => {
      const messageChunks = expo.chunkPushNotifications(messages);
      const expoRequests = messageChunks.map(chunk =>
        expo.sendPushNotificationsAsync(chunk),
      );
      // Resolves once all push notifications have been sent to the push notification provider
      // Does not mean they've made it to the user
      return Promise.all(expoRequests);
    })
    .then(res => console.log('RES', res));
};

module.exports = {
  dbKey,
  addPushToken,
  sendNewNotificationToAll,
};
