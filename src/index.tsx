import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import './index.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import reportWebVitals from './reportWebVitals';


import Layout from './layouts/Layout';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import SettingsUser from './pages/editProfile/SettingsUser';
import IndividualPage from './pages/individual/IndividualPage';
import DetailPost from './pages/detailpost/DetailPost';
import Subscription from './pages/subscription/Subscription';

const router = createBrowserRouter([
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <Register />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/edit-profile',
        element: <SettingsUser />,
      },
      {
        path: '/profile',
        element: <IndividualPage />,
      },
      {
        path: '/post/:id',
        element: <DetailPost />,
      },
      {
        path: '/subscription',
        element: <Subscription />
      }
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SnackbarProvider maxSnack={1}>
        <RouterProvider router={router} />
      </SnackbarProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
