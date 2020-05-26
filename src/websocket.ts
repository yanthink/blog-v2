import Echo from 'laravel-echo';
// @ts-ignore
import io from 'socket.io-client';
import { AuthModelState } from '@/models/connect';
import { getToken, setSocketId } from '@/utils/authority';
import { INotification } from '@/models/I';

function createWebSocket() {
  let echo: Echo;

  return (state: AuthModelState) => {
    if (echo) {
      setSocketId('');
      echo.disconnect();
    }

    if (!state.logged) {
      return;
    }

    echo = new Echo({
      client: io,
      broadcaster: 'socket.io',
      host: SOCKET_HOST,
      withoutInterceptors: true,
      auth: {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    });

    setSocketId(echo.socketId());

    echo
      .private(`App.Models.User.${state.user.id}`)
      .listen('UnreadNotificationsChange', (data: { unread_count: number }) => {
        // eslint-disable-next-line no-underscore-dangle
        window.g_app._store.dispatch({
          type: 'auth/setUnreadCount',
          unread_count: data.unread_count,
        });
      })
      .notification((notification: INotification) => {
        // eslint-disable-next-line no-console
        console.info(notification);
      });
  };
}

export default createWebSocket();
