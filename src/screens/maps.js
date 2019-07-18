import React,{Component} from 'react'
import {View, Text,TouchableOpacity, StyleSheet,Animated,Dimensions,Image,Modal,AsyncStorage}from 'react-native';
import MapView, {Marker} from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/AntDesign';
import firebase from 'firebase';
import user from '../public/user';
import { Button } from 'native-base';

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

export default class maps extends Component {
    constructor(props){
        super(props);
        this.state={
            longitude:'',
            latitude:'',
            data:[],
            modalVisible: false
        },
        this.getLocation()
    }

    getLocation = async()=>{
        await Geolocation.getCurrentPosition(
           (position) => {
             this.setState({
               latitude: position.coords.latitude,
               longitude: position.coords.longitude,
               error: null,
             });
           },
           (error) => this.setState({ error: error.message }),
           { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
         );
       }

    updateLocation = async() =>{
        if (this.state.latitude) {
            await firebase.database().ref('users/'+ user.id).update({
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                status:'online'
            })
        }
    }

	setModalVisible(visible, value) {
        if (value == undefined) {
            this.setState({
                modalVisible: visible,
            })
        }else{
            this.setState({
                modalVisible: visible,
                nama: value.username,
                email: value.email,
                status: value.status
            })
        }
        
 	}

    componentWillMount() {
        this.index = 0;
        this.animation = new Animated.Value(0);
    }

    componentDidMount(){
        firebase.database().ref('users').on('value', (data) =>{
            let values = data.val()
            if (values) {
                const messageList = Object.keys(values).map(key =>({
                  ...values[key],
                  uid: key
                }));
                this.setState({
                  data: messageList
                })
              }
        })

        this.animation.addListener(({ value }) => {
            let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
            if (index >= this.state.data.length) {
              index = this.state.data.length - 1;
            }
            if (index <= 0) {
              index = 0;
            }
      
            clearTimeout(this.regionTimeout);
            this.regionTimeout = setTimeout(() => {
              if (this.index !== index) {
                this.index = index;
                const coordinate = this.state.data[index];
                this.map.animateToRegion(
                  {
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                    latitudeDelta: 0.02864195044303443,
                    longitudeDelta: 0.020142817690068,
                  },
                  350
                );
              }
            }, 10);
          });
    }

    exit = async() =>{
        await AsyncStorage.removeItem('id_user');
        this.props.navigation.navigate('SignIn')
    }

    render(){
        if (this.state.latitude) {
            this.updateLocation()  
            return(
                
                <View style={styles.container}>
                 <View style={styles.container}>
                   <MapView
                        ref={map => this.map = map}
                        style={styles.map}
                        region={{
                            "latitude": this.state.latitude,
                            "longitude": this.state.longitude,
                            latitudeDelta: 0.02864195044303443,
                            longitudeDelta: 0.020142817690068,
                        }}
                        >
                        {this.state.data.map((item)=>{
                            if(item.longitude == '' || item.uid == user.id){
                                
                            }else{
                                return (
                                    <Marker
                                        coordinate={{
                                            latitude: item.latitude,
                                            longitude: item.longitude,
                                        }}
                                        title={item.username}
                                        description="in here"
                                    />
                                )
                            } 
                        })}
                        
                    </MapView>
                    <View>
                        <Modal
                            transparent={true}
                            animationType="fade"
                            visible={this.state.modalVisible}
                            onPress={() => this.setModalVisible(false)}
                        >
                            <View style={{
                                flex:1,
                                backgroundColor: 'rgba(51,51,51,0.5)',
                                }}>
                                <TouchableOpacity onPress={() => this.setModalVisible(false)}
                                style={styles.modelstyle}
                                >
                                    <View style={styles.imageModal}>
                                    <View style={{flex:2}}>
                                        <Image
                                            source={{uri: "https://i.imgur.com/sNam9iJ.jpg"}}
                                            style={styles.images}
                                        />
                                        <Text style={styles.textModal}>{this.state.status}</Text>
                                        <Text style={{fontSize: 15, textAlign:'center'}}>{this.state.nama}</Text>
                                        <View style={{flexDirection:'row', width:'100%', paddingLeft:20, paddingRight:20}}>
                                            <Button success style={{flex:1,marginRight:5}}>
                                                <Text style={{textAlign:'center',width:'100%'}}>Chat</Text>
                                            </Button>
                                            <Button warning style={{flex:1, marginLeft:5}}>
                                                <Text style={{textAlign:'center', width:'100%'}}>Profile</Text>
                                            </Button>
                                        </View>
                                    </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                    </View>
                    <Animated.ScrollView
                        horizontal
                        scrollEventThrottle={1}
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH}
                        onScroll={Animated.event(
                            [
                            {
                                nativeEvent: {
                                contentOffset: {
                                    x: this.animation,
                                },
                                },
                            },
                            ],
                            { useNativeDriver: true }
                        )}
                        style={styles.scrollView}
                        contentContainerStyle={styles.endPadding}
                        >
                        {this.state.data.map((marker, index) => {
                            if(marker.uid !== user.id){
                                return(
                                    <TouchableOpacity onPress={() => this.setModalVisible(true, marker)}>
                                        <View style={styles.card} key={index}>
                                        <Image
                                            source={{uri: "https://i.imgur.com/sNam9iJ.jpg"}}
                                            style={styles.cardImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.textContent}>
                                            <Text numberOfLines={1} style={styles.cardtitle}>{marker.username}</Text>
                                            <Text numberOfLines={1} style={styles.cardDescription}>
                                            {marker.email}
                                            </Text>
                                        </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }
                        })}
                    </Animated.ScrollView>
                    <TouchableOpacity style={styles.fab} onPress={()=>this.props.navigation.navigate('Chat')}>
                        <Icon name="user" size={25} color='#5ba4e5'/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fabRight} onPress={this.exit}>
                        <Icon name="logout" size={25} color='#F3190B'/>
                    </TouchableOpacity>
                </View>
                </View>
                
            )    
        }
        return(
            <View style={styles.container}>
            <View style={styles.container}>
              <MapView
                   style={styles.map}
                   region={{
                       "latitude": -7.7613167,
                       "longitude": 110.3589596,
                       latitudeDelta: 0.015,
                       longitudeDelta: 0.0121,
                   }}>
               </MapView>
           </View>
           </View>
       )    
    }
}

const styles = StyleSheet.create({
    modelstyle:{
        position:'absolute',
        top:0,
        bottom:0,
        right:0,
        left:0,
        justifyContent: 'center', 
		alignItems: 'center'
    },
    imageModal:{
        width: "80%",
        height: 180,
        textAlign: "center",
        alignSelf: "center",
        position: "relative",
        backgroundColor: "#FFF9EC",
        borderRadius: 5,
        elevation: 3
    },
    images:{
        marginTop: 10,
        height:70,
        width:70,
        borderRadius:30,
        alignSelf:'center'
    },
    textModal:{
        textAlign:'center',
        color:'#0CF60B',
        marginTop:2,
        fontWeight:"800"
    },
    container: {
      ...StyleSheet.absoluteFillObject,
      flex:1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    view:{
        position:"absolute"
    },
    scrollView: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },
    endPadding: {
        paddingRight: width - CARD_WIDTH,
    },
    card: {
        padding: 10,
        elevation: 2,
        backgroundColor: "#FFF",
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: -2 },
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        overflow: "hidden",
    },
    cardImage: {
        flex: 3,
        width: "100%",
        height: "100%",
        alignSelf: "center",
    },
    textContent: {
        flex: 1,
    },
    cardtitle: {
        fontSize: 12,
        marginTop: 5,
        fontWeight: "bold",
    },
    cardDescription: {
        fontSize: 12,
        color: "#444",
    },
    markerWrap: {
        alignItems: "center",
        justifyContent: "center",
    },
    marker: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(130,4,150, 0.9)",
    },
    ring: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(130,4,150, 0.3)",
        position: "absolute",
        borderWidth: 1,
        borderColor: "rgba(130,4,150, 0.5)",
    },
    fab: {
        position: 'absolute', 
        width: 58, 
        height: 57, 
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center', 
        left: 10, 
        top: 20, 
        backgroundColor: '#FFFCFC', 
        borderRadius: 50, 
        elevation: 3
    },
    fabRight: {
        position: 'absolute', 
        width: 58, 
        height: 57, 
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center', 
        right: 10, 
        top: 20, 
        backgroundColor: '#FFFCFC', 
        borderRadius: 50, 
        elevation: 3
    }
   });