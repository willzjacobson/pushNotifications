import { Notifications, Permissions } from 'expo';

export const pushNotificationEnabled = async () => {
  const granted = 'granted';

  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS,
  );

  let finalStatus = existingStatus;

  if (existingStatus !== granted) {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== granted) {
    return false;
  }

  return true;
};

export const registerForPushNotifications = async () => {
  const enabled = await pushNotificationEnabled();

  if (!enabled) {
    return Promise.resolve();
  }

  return Notifications.getExpoPushTokenAsync();
};

export const setBadgeNumber = (number = 0) =>
  Notifications.setBadgeNumberAsync(number);
