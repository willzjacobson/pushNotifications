import React from 'react';
import { ActivityIndicator, View, AppState } from 'react-native';

import Question from './screens/Question';
import Waiting from './screens/Waiting';
import Welcome from './screens/Welcome';
import EnablePush from './screens/EnablePush';

import Navigator from './components/Navigator';
import Container from './components/Container';

import * as UserData from './util/UserData';
import * as QuestionData from './util/QuestionData';
import { loadFonts } from './util/fonts';
import { setBadgeNumber } from './util/pushNotifications';

class App extends React.Component {
  state = {
    fontsReady: false,
  };

  componentDidMount() {
    loadFonts().then(() => this.setState({ fontsReady: true }));
    setBadgeNumber(0);
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      setBadgeNumber(0);
    }
  };

  render() {
    if (
      !this.props.user.ready ||
      !this.props.question.ready ||
      !this.state.fontsReady
    ) {
      return (
        <Container padding>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </Container>
      );
    }

    const initialSceneName = this.props.user.onboardingComplete
      ? 'Question'
      : 'Welcome';

    return (
      <Container padding>
        <Navigator
          ref={ref => (this.navigator = ref)}
          initialSceneName={initialSceneName}
          scenes={{
            Welcome: { component: Welcome },
            Question: { component: Question },
            Waiting: { component: Waiting },
            EnablePush: { component: EnablePush },
          }}
        />
      </Container>
    );
  }
}

export default () => (
  <UserData.Provider>
    <QuestionData.Provider>
      <QuestionData.Consumer>
        {question => (
          <UserData.Consumer>
            {user => <App question={question} user={user} />}
          </UserData.Consumer>
        )}
      </QuestionData.Consumer>
    </QuestionData.Provider>
  </UserData.Provider>
);
