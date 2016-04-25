/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  Component,
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import SwipeCards from 'react-native-swipe-cards';

let Card = React.createClass({
  Card(name) {
  this.props.text = name;
  this.props.backgroundColor = 'Red';
  },

  render() {
    return (
      <View style={[styles.card, {backgroundColor: this.props.backgroundColor}]}>
        <Text>{this.props.text}</Text>
      </View>
    )
  }
})

const Cards = [
  {text: 'Tomato', backgroundColor: 'red'},
  {text: 'Aubergine', backgroundColor: 'purple'},
  {text: 'Courgette', backgroundColor: 'green'},
  {text: 'Blueberry', backgroundColor: 'blue'},
  {text: 'Umm...', backgroundColor: 'cyan'},
  {text: 'orange', backgroundColor: 'orange'},
]

var API_URL = 'http://magento.westus.cloudapp.azure.com/index.php/rest/V1/products';
var PAGE_SIZE = 25;
var PARAMS = '?searchCriteria[pageSize]=' + PAGE_SIZE;
var REQUEST_URL = API_URL + PARAMS;

class Magento extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false,
      cards: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.items),
          loaded: true,
          cards: responseData.items.map((x) => new Card(x.name))
        });
      })
      .done();
  }

  handleYup (card) {
    console.log(`Yup for ${card.text}`)
  }
  handleNope (card) {
    console.log(`Nope for ${card.text}`)
  }

  render() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
    <View>

      <SwipeCards
              cards={this.state.cards}

              renderCard={(cardData) => <Card {...cardData} />}
              renderNoMoreCards={() => <NoMoreCards />}

              handleYup={this.handleYup}
              handleNope={this.handleNope}
      />
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderItem}
        style={styles.listView}
      />
    </View>
    );
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text>
          Loading items...
        </Text>
      </View>
    );
  }

  renderItem(item) {
    return (
      <View style={styles.container}>
        <Image
          source={{uri: 'http://magento.westus.cloudapp.azure.com/pub/media/catalog/product/cache/1/small_image/240x300/beff4985b56e3afdbeabfc89641a4582'
          + item.custom_attributes.find((attribute) => { return attribute.attribute_code == "small_image" }).value}}
          style={styles.thumbnail}
        />
        <View style={styles.rightContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.custom_attributes.find((attribute) => { return attribute.attribute_code == "description" }).value}</Text>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
  },
});

AppRegistry.registerComponent('Magento', () => Magento);
