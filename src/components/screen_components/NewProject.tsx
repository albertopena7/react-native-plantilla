import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  Dimensions,
  TextInput as RNTextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  Button,
  Dialog,
  IconButton,
  Paragraph,
  Portal,
} from 'react-native-paper';
import {globalStyles} from '../../theme/theme';
import {useForm} from '../../hooks/useForm';
import {Project, Mark, HasTag, Topic} from '../../interfaces/appInterfaces';
import {StackParams} from '../../navigation/ProjectNavigator';
import {fonts, FontSize} from '../../theme/fonts';
import {Colors} from '../../theme/colors';
import translate from '../../theme/es.json';
import {InputField} from '../../components/InputField';
import {Size} from '../../theme/size';
import {IconTemp} from '../IconTemp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import citmapApi from '../../api/citmapApi';
import {MultiSelect} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props extends StackScreenProps<StackParams, 'NewProjectScreen'> {}

export const NewProject = ({navigation, route}: Props) => {
  const {marks} = route.params;
  const projectNameRef = useRef<RNTextInput>(null);
  const [img, setImg] = useState('');
  const [tempUri, setTempUri] = useState<string>();
  const [project, setProject] = useState<Project>({
    projectName: '',
    description: '',
    photo: '',
    hastag: [],
    topic: [],
    marks: [],
  });
  const [visible, setVisible] = useState(false);
  const {projectName, description, photo, hastag, topic, onChange} =
    useForm<Project>(project);
  const [hasTag, setHasTag] = useState<HasTag[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedHastag, setSelectedHastag] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const showDialog = () => {
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);

  useEffect(() => {
    getHasTag();
    getTopic();
  }, []);

  useEffect(() => {
    if (tempUri) onChange(tempUri, 'photo');
  }, [tempUri]);

  const getHasTag = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const resp = await citmapApi.get('/project/hastag/', {
        headers: {
          Authorization: token,
        },
      });
      if (resp.data) {
        setHasTag(resp.data);
      }
    } catch (e) {
      console.log('error hastag');
    }
  };

  const getTopic = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const resp = await citmapApi.get('/project/topics/', {
        headers: {
          Authorization: token,
        },
      });
      if (resp.data) {
        setTopics(resp.data);
      }
    } catch (e) {
      console.log('error topic');
    }
  };

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.5,
      },
      response => {
        if (response.didCancel) return;
        if (response.assets) {
          setTempUri(response.assets![0].uri?.toString());
        }
      },
    );
  };

  const galeria = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
      },
      response => {
        if (response.didCancel) return;
        if (response.assets) {
          setTempUri(response.assets![0].uri);
        }
      },
    );
  };

  const deleteImage = () => {
    if (tempUri) {
      setTempUri(undefined);
    }
  };

  const nextScreen = () => {
    if (
      projectName.length > 0 &&
      description.length > 0 &&
      hasTag.length > 0
    ) {
      navigation.navigate('Marcador', {
        projectName,
        description,
        photo,
        marks,
        hastag,
        topic,
        onBack: true,
      });
    } else {
      showDialog();
    }
  };

  const clearNameRef = () => {
    projectNameRef.current!.clear();
  };

  const renderDataItem = (item: HasTag) => {
    return (
      <View style={styles.item}>
        <Text style={styles.selectedTextStyle}>{item.hasTag}</Text>
        <Icon name={'abjad-hebrew'} size={Size.iconSizeMin} color={'black'} />
      </View>
    );
  };

  const renderDataItemTopic = (item: Topic) => {
    return (
      <View style={styles.item}>
        <Text style={styles.selectedTextStyle}>{item.topic}</Text>
        <Icon name={'abjad-hebrew'} size={Size.iconSizeMin} color={'black'} />
      </View>
    );
  };

  //habría que borrarlos y añadirlos en base de datos?
  const onNewText = (item: string) => {
    // setSelectedHastag([...selectedHastag, item]);
    console.log(selectedHastag);
  };

  return (
    <>
      <KeyboardAvoidingView style={{...globalStyles.globalMargin, flex: 1}}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <Text style={fonts.title}>
            {translate.strings.new_project_screen[0].title}
          </Text>
          <View>
            <InputField
              label={translate.strings.new_project_screen[0].project_name_input}
              icon="format-title"
              keyboardType="email-address"
              multiline={false}
              numOfLines={1}
              onChangeText={value => onChange(value, 'projectName')}
              iconColor={Colors.lightorange}
            />

            <InputField
              label={translate.strings.new_project_screen[0].description_input}
              icon="text"
              keyboardType="default"
              multiline={true}
              numOfLines={6}
              onChangeText={value => onChange(value, 'description')}
              iconColor={Colors.lightorange}
            />
            {/* MultiSelect de hastag */}
            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: '5%',
              }}>
              <View
                style={{
                  width: '80%',
                  // backgroundColor: 'blue'
                }}>
                <MultiSelect
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  // inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={hasTag}
                  labelField="hasTag"
                  valueField="id"
                  placeholder="Hastags"
                  value={selectedHastag}
                  search
                  searchPlaceholder="Buscar..."
                  onChangeText={text => onNewText(text)}
                  onChange={item => {
                    setSelectedHastag(item);
                    onChange(item, 'hastag');
                  }}
                  renderItem={renderDataItem}
                  renderSelectedItem={(item, unSelect) => (
                    <TouchableOpacity
                      onPress={() => unSelect && unSelect(item)}>
                      <View style={styles.selectedStyle}>
                        <Text style={styles.textSelectedStyle}>
                          {item.hasTag}
                        </Text>
                        <Icon
                          name={'delete'}
                          size={Size.iconSizeMin}
                          // color={'black'}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <View
                style={{
                  justifyContent: 'flex-start',
                  alignContent: 'center',
                  width: '18%',
                  // backgroundColor: 'red',
                  
                }}>
                <TouchableOpacity style={{
                      
                    }}>
                  <View
                    style={{
                      ...styles.selectedStyle,
                      height: Size.window.height * 0.035,
                      marginTop: 0,
                      borderRadius: 50,
                    }}>
                    <Icon
                      name={'plus'}
                      size={Size.iconSizeMin}
                      color={Colors.darkorange}
                    />
                    <Text
                      style={{
                        ...styles.textSelectedStyle,
                        color: Colors.darkorange,
                      }}>
                      ADD
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* MultiSelect de topic */}
            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: '8%',
              }}>
              <View
                style={{
                  width: '80%',
                }}>
                <MultiSelect
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  // inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={topics}
                  labelField="topic"
                  valueField="id"
                  placeholder="Topics"
                  value={selectedTopics}
                  search
                  searchPlaceholder="Buscar..."
                  onChangeText={text => onNewText(text)}
                  onChange={item => {
                    setSelectedTopics(item);
                    onChange(item, 'topic');
                  }}
                  renderItem={renderDataItemTopic}
                  renderSelectedItem={(item, unSelect) => (
                    <TouchableOpacity
                      onPress={() => unSelect && unSelect(item)}>
                      <View style={styles.selectedStyle}>
                        <Text style={styles.textSelectedStyle}>
                          {item.topic}
                        </Text>
                        <Icon
                          name={'delete'}
                          size={Size.iconSizeMin}
                          // color={'black'}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <View
                style={{
                  justifyContent: 'flex-start',
                  alignContent: 'center',
                  width: '18%',
                }}>
                <TouchableOpacity>
                  <View
                    style={{
                      ...styles.selectedStyle,
                      marginTop: 0,
                      borderRadius: 50,
                      height: Size.window.height * 0.035,
                    }}>
                    <Icon
                      name={'plus'}
                      size={Size.iconSizeMin}
                      color={Colors.darkorange}
                    />
                    <Text
                      style={{
                        ...styles.textSelectedStyle,
                        color: Colors.darkorange,
                      }}>
                      ADD
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                // width: window.width - 25,
              }}>
              <Text
                style={{
                  marginTop: '8%',
                  marginBottom: '3%',
                  color: '#2F3061',
                  fontSize: FontSize.fontSizeText,
                }}>
                {translate.strings.new_project_screen[0].image_title}
              </Text>
            </View>
            <View style={styles.photoContainer}>
              {!tempUri && (
                <View style={styles.photo}>
                  <IconButton
                    icon="image-album"
                    iconColor="#5F4B66"
                    size={Size.iconSizeLarge}
                    onPress={() => galeria()}
                  />
                </View>
              )}
              {tempUri && (
                <>
                  <Image
                    source={{
                      uri: tempUri,
                    }}
                    style={{
                      width: '90%',
                      height: 350,
                      backgroundColor: 'white',
                      alignSelf: 'center',
                      borderRadius: 10,
                    }}
                  />
                  <Button
                    style={{margin: 15, width: 150, alignSelf: 'center'}}
                    icon="delete"
                    mode="elevated"
                    buttonColor="white"
                    onPress={() => deleteImage()}>
                    Borrar imagen
                  </Button>
                </>
              )}
            </View>
          </View>
        </ScrollView>

        {/* nextButton */}
        <View style={{...styles.bottomViewButtonNav}}>
          <Button
            icon="chevron-right"
            mode="elevated"
            contentStyle={{flexDirection: 'row-reverse'}}
            buttonColor="white"
            labelStyle={{
              fontSize: FontSize.fontSizeText,
              justifyContent: 'center',
              top: '1%',
              paddingVertical: 5,
            }}
            onPress={() => nextScreen()}>
            {translate.strings.global[0].next_button}
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* back button */}
      <View style={globalStyles.viewButtonBack}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.goBack()}>
          <View
            style={{
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <IconTemp name="chevron-left" size={Size.iconSizeLarge} />
          </View>
        </TouchableOpacity>
      </View>

      {/* err modal */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title style={{alignSelf: 'center'}}>
            Error de creación
          </Dialog.Title>
          <Dialog.Content style={{top: '4%', paddingVertical: 10}}>
            <Paragraph style={styles.modalText}>
              Es necesario establecer un nombre y una descripción válidos.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity activeOpacity={0.5} onPress={hideDialog}>
              <View
                style={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  margin: '5%',
                }}>
                <Text style={{fontSize: FontSize.fontSizeText, color: 'black'}}>
                  Cerrar
                </Text>
              </View>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: '4%',
  },

  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
  touchable: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  textButton: {
    color: 'black',
  },
  bottomViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  photoContainer: {
    marginBottom: '10%',
  },
  photo: {
    alignItems: 'center',
    flex: 1,
    alignSelf: 'center',
    height: '100%',
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.lightorange,
    justifyContent: 'center',
    backgroundColor: '#EADEDA',
  },

  bottomViewButtonNav: {
    flexDirection: 'row-reverse',
    marginHorizontal: 5,
    marginBottom: 10,
  },

  textInput: {
    width: '90%',
    // height: height,
    justifyContent: 'center',
    marginTop: 15,
    paddingLeft: 25,
    paddingBottom: 0,
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: Colors.lightorange,
    fontSize: FontSize.fontSizeText,
  },
  modalText: {
    fontSize: FontSize.fontSizeText,
    textAlign: 'center',
    paddingVertical: FontSize.fontSizeText,
    flexShrink: 1,
  },
  ///////////////////////////////

  dropdown: {
    height: Size.window.height * 0.035,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '4%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  placeholderStyle: {
    fontSize: FontSize.fontSizeText,
  },
  selectedTextStyle: {
    fontSize: FontSize.fontSizeTextMin,
  },
  iconStyle: {
    width: Size.iconSizeMin,
    height: Size.iconSizeMin,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: FontSize.fontSizeTextMin,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: '3%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white',
    marginTop: 8,
    marginRight: '3%',
    paddingHorizontal: '4%',
    marginVertical: '4%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    paddingVertical: '2%',
    fontSize: FontSize.fontSizeTextMin,
    color: Colors.lightorange
  },

  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
});

{
  /* <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
              <TextInput
                style={{
                  ...styles.textInput,
                }}
                placeholder={
                  translate.strings.new_project_screen[0].description_input
                }
                mode="flat"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={value => onChange(value, 'description')}
                underlineColor="#B9E6FF"
                activeOutlineColor="#5C95FF"
                selectionColor="#2F3061"
                textColor="#2F3061"
                outlineColor="#5C95FF"
                autoFocus={false}
                dense={false}
                multiline={true}
                numberOfLines={10}
              />
            </View> */
}
