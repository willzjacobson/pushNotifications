import React from 'react';
import { AsyncStorage, Platform } from 'react-native';

import { ENDPOINT } from './api';
import { registerForPushNotifications } from './pushNotifications';

const defaultState = {
  ready: false,
  onboardingComplete: false,
  username: null,
  totalAnswered: 0,
  correctAnswered: 0,
  answers: {},
  pushEnabled: false,
};

const UserContext = React.createContext(defaultState);

export const Consumer = UserContext.Consumer;

export class Provider extends React.Component {
  state = defaultState;

  componentDidMount() {
    AsyncStorage.getItem('userData')
      .then(state => {
        this.setState({
          ...JSON.parse(state),
          ready: true,
        });
      })
      .catch(err => {
        alert('An error occurred loading your user data.');
        console.log('user data loading error', err);
      });
  }

  componentDidUpdate() {
    AsyncStorage.setItem(
      'userData',
      JSON.stringify({ ...this.state, ready: false }),
    );
  }

  setUsername = (username = null) => {
    this.setState({ username });
  };

  answerQuestion = (question, answer) => {
    this.setState(state => ({
      answers: {
        ...state.answers,
        [question._id]: { wasCorrect: answer.correct, answer: answer.answer },
      },
      totalAnswered: state.totalAnswered + 1,
      correctAnswered: answer.correct
        ? state.correctAnswered + 1
        : state.correctAnswered,
    }));
  };

  completeOnboarding = () => this.setState({ onboardingComplete: true });

  logout = () => {
    this.setState({ ...defaultState, ready: true });
  };

  enablePushNotifications = () =>
    registerForPushNotifications().then(token => {
      if (token) {
        this.setState({ pushEnabled: true });

        return fetch(`${ENDPOINT}/push/add-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pushToken: token,
            platform: Platform.OS,
            timezoneOffset: new Date().getTimezoneOffset(),
          }),
        });
      }

      this.setState({ pushEnabled: false });
      return Promise.resolve();
    });

  render() {
    return (
      <UserContext.Provider
        value={{
          ...this.state,
          logout: this.logout,
          completeOnboarding: this.completeOnboarding,
          setUsername: this.setUsername,
          answerQuestion: this.answerQuestion,
          enablePushNotifications: this.enablePushNotifications,
        }}
      >
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
