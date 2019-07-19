import React, { Component } from 'react';
import { Container, Header, Body, Left, Right,Title,Icon,Button, Thumbnail } from 'native-base';
import {StyleSheet, Image, View,Text} from 'react-native';
import firebase from 'firebase';
import { ScrollView } from 'react-native-gesture-handler';
import user from '../public/user';

export default class Profile extends Component {
    constructor(props){
        super(props);
        this.state = {
            btnmasuk:false,
            btndelete:false,
            datas: []
        }
    }

    componentDidMount = async() => {
        await firebase.database().ref().child('users').child(user.id).on('value', data =>{
            let value = data.val()
            this.setState({
                datas:value,
                btnmasuk:false,
                btndelete:false,
            })
        })        
    }

    info =()=>{
        this.setState({
            btnmasuk:!this.state.btnmasuk
        })
        let item = this.state.datas
        this.props.navigation.navigate('editProfile', item)
    }

    delete =()=>{
        this.setState({
            btndelete:!this.state.btndelete
        })
    }

  render() {
      console.log(this.state.datas.email)
    return (
      <Container>
        <Header 
            style={{backgroundColor: '#fff'}}>
        <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon style={{color:'#000'}} name='arrow-back' />
            </Button>
        </Left>
          <Body>
            <Title style={{color: '#000'}}>{this.state.datas.username}</Title>
          </Body>
          <Right />
        </Header>
        <ScrollView>
            <View style={{flex:1}}>
                <View style={{flex:1, flexDirection:'row', marginBottom:20}}>
                    <View style={{flex:1}}>
                        <Image
                            source={{uri: this.state.datas.image}}
                            style={styles.image}
                        />
                    </View>
                </View>
                <View style={{flex:2}}>
                    <View style={{flex:1, flexDirection:'column', paddingLeft:20, paddingRight:20}}>
                        <View style={{flex:1}}>
                            <Text style={{fontSize:25}}>{this.state.datas.username}</Text>
                        {this.state.datas.status === "online" ?
                            <Text style={{fontSize:17,color:'green'}}>{this.state.datas.status}</Text>
                        :
                            <Text style={{fontSize:17, color:'red'}}>{this.state.datas.status}</Text>
                        }
                            <Text style={{fontSize:17, marginTop:10}}>About Me</Text>
                        {this.state.datas.aboutMe ? 
                            <Text style={{fontSize:14}}>{this.state.datas.aboutMe}</Text>
                        :
                            <Text style={{fontSize:14}}>-</Text>
                        }
                            <Text style={{fontSize:17, marginTop:10}}>Gender</Text>
                            <Text style={{fontSize:14}}>{this.state.datas.gender}</Text>    
                        </View>
                        <View style={{flexDirection:'row', marginTop:20}}>
                        {this.state.btnmasuk === false ? 
                            <Button bordered info style={{flex:1, justifyContent:'center', marginRight:10}} onPress={this.info}>
                                <Text>Edit profile</Text>
                            </Button>
                                : 
                            <Button success style={{flex:1, justifyContent:'center', marginRight:10}} onPress={this.info}>
                                <Text>Edit profile</Text>
                            </Button>}
                        {this.state.btndelete === false ? 
                            <Button bordered style={{flex:1, justifyContent:'center', marginLeft:10}} onPress={this.delete}>
                                <Text>Delete</Text>
                            </Button>
                        :
                            <Button danger style={{flex:1, justifyContent:'center', marginLeft:10}} onPress={this.delete}>
                                <Text>Delete</Text>
                            </Button>
                        }
                        </View>
                        <View style={{flex:1, marginTop: 20}}>
                            <View style={{marginBottom:20}}>
                                <Text style={{fontSize:14, color:'#0BF1F3', fontWeight:'bold'}}>Phone Number</Text>
                                <Text>{this.state.datas.noPhone}</Text>
                            </View>
                            <View>
                                <Text style={{fontSize:14, color:'#0BF1F3', fontWeight:'bold'}}>EMAIL</Text>
                                <Text>{this.state.datas.email}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
    image:{
        height: 120,
        width:120,
        borderRadius:60,
        alignSelf:'center',
        marginTop: 30
        
    }
})