import Echo from 'laravel-echo';
// @ts-ignore
import io from 'socket.io-client';
import { AuthStateType } from '@/models/connect';
import { getToken, setSocketId } from '@/utils/authority';
import { INotification } from '@/models/data';

function createWebSocket () {
  let echo: Echo;

  return (state: AuthStateType) => {
    if (echo) {
      setSocketId('');
      echo.disconnect();
    }

    if (!state.user.id) {
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

    echo.private(`App.Models.User.${state.user.id}`)
      .listen('UnreadNotificationsChange', (data: { unread_count: number }) => {
        window.g_app._store.dispatch({
          type: 'auth/setUnreadCount',
          unread_count: data.unread_count,
        });
      })
      .notification((notification: INotification) => {
        console.info(notification);
      });

  };
}

export default createWebSocket();
