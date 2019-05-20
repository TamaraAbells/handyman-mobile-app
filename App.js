import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';
import axios from 'axios';
import {AsyncStorage} from 'react-native';

const URL = 'https://cryptic-dusk-24156.herokuapp.com/handyman';


let INITIAL_STATE = {
  isLoggedIn: false,
  loggingIn: false,
  endingJob: false,
  user: null,
  token: null,
  orderId: null,
  settingAvailablity: false,
}


export const login = (username, password) => {

  return (dispatch) => {
    dispatch(SET_LOGIN_STATUS(true));
    return axios.post(`${URL}/login`, {
      // for the sake of the hackathon we are using this user
      username: 'arinze.nnaji',
      password: 'P@$$w0rd'
    }).then((res) => {
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      dispatch(SET_LOGIN_STATUS(false));
      dispatch(SET_TOKEN(res.data));
      dispatch(SET_USER(res.data));
    }).catch ((err) => {
      console.log( 'error')
    })
  }
}


export const setAvailabilityStatus = ( { availabiltyStatus }) => {
  return (dispatch) => {
    dispatch(SET_LOADING_AVAILABLITY(true));
    return axios.patch(`${URL}/me`, { available: availabiltyStatus }).then((res) => {
      dispatch(SET_USER(res.data));
      dispatch(SET_LOADING_AVAILABLITY(false));
      return res.data
    }).catch ((err) => {
      console.log( 'error')
      dispatch(SET_LOADING_AVAILABLITY(false));
    })
  }
}


export const endJob = (orderId) => {
  return (dispatch) => {
    dispatch(SET_ENDING_JOB(true));
    return axios.post(`https://cryptic-dusk-24156.herokuapp.com/order/end/${orderId}`).then((res) => {
      dispatch(SET_ENDING_JOB(false));
      dispatch(SET_ORDER_ID(null));
      return res.data
    }).catch ((err) => {
      console.log( 'error', err.data)
      dispatch(SET_ENDING_JOB(false));
    })
  }
}


export const setOrderId = (orderId) => {
  return (dispatch) => {
    dispatch(SET_ORDER_ID(orderId));
  }
}


// Register the token of the device for push notifications
export const registerToken = ( { deviceToken }) => {
  return (dispatch) => {
    return axios.patch(`${URL}/me`, { deviceToken }).then((res) => {
      return res.data
    }).catch ((err) => {
      console.log( 'error')
    })
  }
}


// ACTION CREATORS
export const SET_LOGIN_STATUS = (payload) => {
  return {
    type: 'SET_LOGIN_STATUS',
    payload,
  }
}

export const SET_ENDING_JOB = (payload) => {
  return {
    type: 'SET_ENDING_JOB',
    payload,
  }
}

export const SET_ORDER_ID = (payload) => {
  return {
    type: 'SET_ORDER_ID',
    payload,
  }
}

export const SET_LOADING_AVAILABLITY = (payload) => {
  return {
    type: 'SET_LOADING_AVAILABLITY',
    payload,
  }
}

export const SET_USER = (payload) => {
  return {
    type: 'SET_USER',
    payload,
  }
}

export const SET_TOKEN = (payload) => {
  return {
    type: 'SET_TOKEN',
    payload,
  }
}


// MAIN/ROOT REDUCER
const rootReducer = (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case 'SET_LOGIN_STATUS': {
      return {
        ...state,
        loggingIn: action.payload
      }
    }
    case 'SET_ENDING_JOB': {
      return {
        ...state,
        endingJob: action.payload
      }
    }
    case 'SET_ORDER_ID': {
      return {
        ...state,
        orderId: action.payload
      }
    }
    case 'SET_LOADING_AVAILABLITY': {
      return {
        ...state,
        settingAvailablity: action.payload
      }
    }
    case 'SET_USER': {

      const newState = {
        ...state,
        user: action.payload.handyman || action.payload,
      }
      return newState
    }
    case 'SET_TOKEN': {
      return {
        ...state,
        token: action.payload.token,
      }
    }
    default: {
      return state
    }
  }
}


const _retrieveData = async () => {
};


const store = createStore(
  rootReducer,
  INITIAL_STATE,
  applyMiddleware(
    reduxThunk
  )
)


store.subscribe(() => {
  // console.log('sds', store.getState());
})

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <Provider store={store}>
            <AppNavigator />
          </Provider>
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        ...Icon.Ionicons.font,
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  async componentDidMount() {
    await Font.loadAsync(
      'antoutline',
      require('@ant-design/icons-react-native/fonts/antoutline.ttf')
    );
  }



  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
