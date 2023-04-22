import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Speech from 'expo-speech';

import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import firebase from 'firebase';

let customFonts = {
  'Bubblegum-Sans': require('../assets/fonts/BubblegumSans-Regular.ttf'),
};

export default class TipScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fontsLoaded: false,
      speakerColor: 'gray',
      speakerIcon: 'volume-high-outline',
      light_theme: true,
      likes: this.props.route.params.tip.likes,
      is_liked: false,
    };
  }

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
    this.fetchUser();
  }

  fetchUser = () => {
    let theme;
    firebase
      .database()
      .ref('/users/' + firebase.auth().currentUser.uid)
      .on('value', (snapshot) => {
        theme = snapshot.val().current_theme;
        this.setState({ light_theme: theme === 'light' });
      });
  };

  async initiateTTS(title, author, tip, overview) {
    const current_color = this.state.speakerColor;
    this.setState({
      speakerColor: current_color === 'gray' ? '#ee8249' : 'gray',
    });
    if (current_color === 'gray') {
      Speech.speak(`${title} by ${author}`);
      Speech.speak(tip);
      Speech.speak('The overview of the tip is!');
      Speech.speak(overview);
    } else {
      Speech.stop();
    }
  }

  likeAction = () => {
    if (this.state.is_liked) {
      firebase
        .database()
        .ref('posts')
        .child(this.props.route.params.tip_id)
        .child('likes')
        .set(firebase.database.ServerValue.increment(-1));
      this.setState({ likes: this.state.likes - 1, is_liked: false });
    } else {
      firebase
        .database()
        .ref('posts')
        .child(this.props.route.params.tip_id)
        .child('likes')
        .set(firebase.database.ServerValue.increment(1));
      this.setState({ likes: this.state.likes + 1, is_liked: true });
    }
  };

  render() {
    if (!this.props.route.params) {
      this.props.navigation.navigate('Home');
    } else if (!this.state.fontsLoaded) {
      return <AppLoading />;
    } else {
      let images = {
        image_1: require("../assets/tip_image_1.png"),
        image_2: require("../assets/tip_image_2.png"),
        image_3: require("../assets/tip_image_3.png"),
        image_4: require("../assets/tip_image_4.png"),
        image_5: require("../assets/tip_image_5.png")
      }
      return (
        <View
          style={
            this.state.light_theme ? styles.containerLight : styles.container
          }>
          <SafeAreaView style={styles.droidSafeArea} />
          <View style={styles.appTitle}>
            <View style={styles.appIcon}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.iconImage}></Image>
            </View>
            <View style={styles.appTitleTextContainer}>
              <Text
                style={
                  this.state.light_theme
                    ? styles.appTitleTextLight
                    : styles.appTitleText
                }>
                Game Tip App
              </Text>
            </View>
          </View>
          <View style={styles.tipContainer}>
            <ScrollView
              style={
                this.state.light_theme
                  ? styles.tipCardLight
                  : styles.tipCard
              }>
              <Image
                source={images[this.props.route.params.tip.preview_image]}
                style={styles.image}></Image>
              <View style={styles.dataContainer}>
                <View style={styles.titleTextContainer}>
                  <Text
                    style={
                      this.state.light_theme
                        ? styles.tipTitleTextLight
                        : styles.tipTitleText
                    }>
                    {this.props.route.params.tip.title}
                  </Text>
                  <Text
                    style={
                      this.state.light_theme
                        ? styles.tipAuthorTextLight
                        : styles.tipAuthorText
                    }>
                    {this.props.route.params.tip.author}
                  </Text>
                  <Text
                    style={
                      this.state.light_theme
                        ? styles.tipAuthorTextLight
                        : styles.tipAuthorText
                    }>
                    {this.props.route.params.tip.created_on}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      this.initiateTTS(
                        this.props.route.params.tip.title,
                        this.props.route.params.tip.author,
                        this.props.route.params.tip.tip,
                        this.props.route.params.tip.overview
                      )
                    }>
                    <Ionicons
                      name={this.state.speakerIcon}
                      size={RFValue(30)}
                      color={this.state.speakerColor}
                      style={{ margin: RFValue(15) }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.tipTextContainer}>
                <Text
                  style={
                    this.state.light_theme
                      ? styles.tipTextLight
                      : styles.tipText
                  }>
                  {this.props.route.params.tip.tip}
                </Text>
                <Text
                  style={
                    this.state.light_theme
                      ? styles.overviewTextLight
                      : styles.overviewText
                  }>
                  Overview - {this.props.route.params.tip.overview}
                </Text>
              </View>
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={
                    this.state.is_liked
                      ? styles.likeButtonLiked
                      : styles.likeButtonDisliked
                  }
                  onPress={() => this.likeAction()}>
                  <Ionicons
                    name={'heart'}
                    size={RFValue(30)}
                    color={this.state.light_theme ? 'black' : 'white'}
                  />

                  <Text
                    style={
                      this.state.light_theme
                        ? styles.likeTextLight
                        : styles.likeText
                    }>
                    {this.state.likes}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15193c',
  },
  containerLight: {
    flex: 1,
    backgroundColor: 'white',
  },
  droidSafeArea: {
    marginTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : RFValue(35),
  },
  appTitle: {
    flex: 0.07,
    flexDirection: 'row',
  },
  appIcon: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  appTitleTextContainer: {
    flex: 0.7,
    justifyContent: 'center',
  },
  appTitleText: {
    color: 'white',
    fontSize: RFValue(28),
    fontFamily: 'Bubblegum-Sans',
  },
  appTitleTextLight: {
    color: 'black',
    fontSize: RFValue(28),
    fontFamily: 'Bubblegum-Sans',
  },
  tipContainer: {
    flex: 1,
  },
  tipCard: {
    margin: RFValue(20),
    backgroundColor: '#2f345d',
    borderRadius: RFValue(20),
  },
  tipCardLight: {
    margin: RFValue(20),
    backgroundColor: 'white',
    borderRadius: RFValue(20),
    shadowColor: 'rgb(0, 0, 0)',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: '100%',
    alignSelf: 'center',
    height: RFValue(200),
    borderTopLeftRadius: RFValue(20),
    borderTopRightRadius: RFValue(20),
    resizeMode: 'contain',
  },
  dataContainer: {
    flexDirection: 'row',
    padding: RFValue(20),
  },
  titleTextContainer: {
    flex: 0.8,
  },
  tipTitleText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    color: 'white',
  },
  tipTitleTextLight: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    color: 'black',
  },
  tipAuthorText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(18),
    color: 'white',
  },
  tipAuthorTextLight: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(18),
    color: 'black',
  },
  iconContainer: {
    flex: 0.2,
  },
  tipTextContainer: {
    padding: RFValue(20),
  },
  tipText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(15),
    color: 'white',
  },
  tipTextLight: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(15),
    color: 'black',
  },
  overviewText: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(20),
    color: 'white',
  },
  overviewTextLight: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(20),
    color: 'black',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: RFValue(10),
  },
  likeButtonLiked: {
    flexDirection: 'row',
    width: RFValue(160),
    height: RFValue(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eb3948',
    borderRadius: RFValue(30),
  },
  likeButtonDisliked: {
    flexDirection: 'row',
    width: RFValue(160),
    height: RFValue(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#eb3948',
    borderRadius: RFValue(30),
    borderWidth: 2,
  },
  likeText: {
    color: 'white',
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    marginLeft: RFValue(5),
  },
  likeTextLight: {
    fontFamily: 'Bubblegum-Sans',
    fontSize: RFValue(25),
    marginLeft: RFValue(5),
  },
});
