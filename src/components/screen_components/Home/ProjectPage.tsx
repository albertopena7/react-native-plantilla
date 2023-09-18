import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  Share,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {Text} from 'react-native-paper';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Size} from '../../../theme/size';
import {StackScreenProps} from '@react-navigation/stack';
import {StackParams} from '../../../navigation/HomeNavigator';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {ScrollView} from 'react-native';
import {FontSize} from '../../../theme/fonts';
import HeartFill from '../../../assets/icons/general/heart-fill.svg';
import ShareIcon from '../../../assets/icons/general/share.svg';
import People from '../../../assets/icons/general/people.svg';
import Chevron from '../../../assets/icons/general/chevron-left-1.svg';
import PencilSquare from '../../../assets/icons/general/pencil-square-1.svg';
import Download from '../../../assets/icons/general/Vector-1.svg';
import {CustomButton} from '../../utility/CustomButton';
import {Colors} from '../../../theme/colors';
import {Project} from '../../../interfaces/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import citmapApi from '../../../api/citmapApi';
import {HasTag} from '../../../interfaces/appInterfaces';
import {LoadingScreen} from '../../../screens/LoadingScreen';
import {SaveProyectModal} from '../../utility/Modals';

const data = [
  require('../../../assets/icons/category/Group-1.png'),
  require('../../../assets/icons/category/Group-2.png'),
  require('../../../assets/icons/category/Group-3.png'),
  require('../../../assets/icons/category/Group-4.png'),
  require('../../../assets/icons/category/Group-5.png'),
  // require('../../../assets/icons/category/Group-6.png'),
  // require('../../../assets/icons/category/Group-7.png'),
  // require('../../../assets/icons/category/Group-8.png'),
  // require('../../../assets/icons/category/Group.png'),
  // require('../../../assets/icons/category/Group-1.png'),
  // require('../../../assets/icons/category/Group-1.png'),
  // Agrega más imágenes y títulos según necesites
];

interface Props extends StackScreenProps<StackParams, 'ProjectPage'> {}

export const ProjectPage = (props: Props) => {
  //#region estados y referencias
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAllCharged, setIsAllCharged] = useState(false);

  const isCarousel = useRef(null);

  const [project, setProject] = useState<Project>();
  const [hastags, setHastags] = useState<HasTag[]>([]);

  //#region MODAL NEW
  /**
   * Elementos del modal
   */
  const [saveModal, setSaveModal] = useState(false);
  const showModalSave = () => setSaveModal(true);
  const hideModalSave = () => setSaveModal(false);
  //#endregion

  //#endregion

  //#region USEEFECT

  useEffect(() => {
    //si entra nada mas crear un project
    if (props.route.params.isNew) {
      showModalSave();
    }
    getProjectApi();
  }, []);

  useEffect(() => {
    // si existe el proyecto
    if (project) {
      // si no hay hastags en project
      if (project.hasTag.length <= 0) {
        setIsAllCharged(true);
      } else {
        // si hay hastags en project
        // si el numero de hastags que hemos guardado coincide con el numero de hastags del project
        if (hastags.length === project.hasTag.length) {
          setIsAllCharged(true);
        }
      }
    }
  }, [hastags]);

  useEffect(() => {
    getHastagApi();
  }, [project]);

  //#endregion

  //#region METODOS

  /**
   * Metodo para compartir, en message pones lo que quieres compartir
   */
  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'https://play.google.com/store/apps/details?id=nic.goi.aarogyasetu&hl=en',
        title: 'Compartir el proyecto con:',
        url: 'www.google.es',
      });
      console.log(result);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log(result.activityType);
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {}
  };

  /**
   * Metodo para descargar el proyecto
   */
  const onDownload = async () => {};

  /**
   * Metodo para volver atrás
   */
  const onBack = () => {
    props.navigation.goBack();
  };

  const getProjectApi = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const resp = await citmapApi.get<Project>(
        `/project/${props.route.params.id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setProject(resp.data);
    } catch {}
  };

  const getHastagApi = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const resp = await citmapApi.get<HasTag[]>('/project/hastag/', {
        headers: {
          Authorization: token,
        },
      });
      const filteredHashtags = resp.data.filter(hasTag =>
        project?.hasTag.includes(hasTag.id),
      );
      setHastags(filteredHashtags);
    } catch {}
  };

  //#endregion

  if (isAllCharged) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView>
      <ScrollView
        // contentContainerStyle={{flexGrow: 1}}
        onTouchCancel={() => hideModalSave()}
        keyboardShouldPersistTaps="handled">
        {/* Ocultar la barra de estado */}
        <StatusBar hidden />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{project?.name}</Text>
        </View>

        <View style={{flex: 1}}>
          {/* first part */}
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <Carousel
              data={data}
              renderItem={x => {
                return (
                  <View style={styles.slide}>
                    <Image
                      source={x.index}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </View>
                );
              }}
              itemWidth={Size.window.width + 2}
              sliderWidth={Size.window.height / 2}
              layout="default"
              onSnapToItem={index => setCarouselIndex(index)}
              useScrollView={true}
              automaticallyAdjustContentInsets
              automaticallyAdjustKeyboardInsets
              // autoplay
              // autoplayInterval={5000}
              // autoplayDelay={5000}
              // loop
            />
            <View
              style={{
                bottom: RFPercentage(0),
                right: RFPercentage(5),
                left: RFPercentage(5),
                position: 'absolute',
              }}>
              <Pagination
                dotsLength={data.length}
                activeDotIndex={carouselIndex}
                ref={isCarousel}
                dotStyle={{
                  width: RFPercentage(3.5),
                  height: RFPercentage(0.5),
                  backgroundColor: 'rgba(0, 0, 0, 0.92)',
                  marginHorizontal: RFPercentage(0.1),
                }}
                inactiveDotStyle={{
                  width: RFPercentage(5),
                  height: RFPercentage(0.5),
                }}
                dotContainerStyle={{
                  marginHorizontal: RFPercentage(0.05),
                }}
                // animatedDuration={100}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
              />
            </View>
          </View>
          {/* half part */}
          <View
            style={{
              marginVertical: RFPercentage(2),
              marginHorizontal: RFPercentage(2.5),
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                // marginTop: '15%',
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              {/* personas */}
              <TouchableOpacity
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                {/* <IconBootstrap name={'plus'} size={20} color={'black'} /> */}
                <People
                  width={RFPercentage(2.5)}
                  height={RFPercentage(2.5)}
                  color={'#000000'}
                />
                <Text
                  style={{
                    fontSize: FontSize.fontSizeText13,
                    marginHorizontal: RFPercentage(1),
                    alignSelf: 'center',
                  }}>
                  1500
                </Text>
              </TouchableOpacity>

              {/*favorito */}
              <TouchableOpacity
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <HeartFill
                  width={RFPercentage(2.5)}
                  height={RFPercentage(2.5)}
                  color={'#ff0000'}
                />
                {/* {boolHelper ? (
                    <HeartFill width={16} height={16} color={'#ff0000'} />
                  ) : (
                    <Heart width={16} height={16} color={'#000000'} />
                  )} */}
                <Text
                  style={{
                    fontSize: FontSize.fontSizeText13,
                    marginHorizontal: RFPercentage(1),
                    alignSelf: 'center',
                  }}>
                  120
                </Text>
              </TouchableOpacity>

              {/* boton de compartir */}
              <TouchableOpacity
                style={{
                  marginLeft: RFPercentage(1),
                  marginRight: RFPercentage(7),
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => onShare()}>
                <ShareIcon
                  width={RFPercentage(2.5)}
                  height={RFPercentage(2.5)}
                  color={'#ff0000'}
                />
              </TouchableOpacity>
            </View>
            {/* participar */}
            <View
              style={{
                width: RFPercentage(12),
                marginHorizontal: RFPercentage(1),
                bottom: 2,
              }}>
              <CustomButton
                onPress={() => console.log('pressed')}
                label="¡Participar!"
                backgroundColor={Colors.primaryLigth}
              />
            </View>
          </View>
          {/* end part */}
          <View style={{marginHorizontal: RFPercentage(2)}}>
            <View>
              <View
                style={{
                  // marginHorizontal: 14,
                  marginTop: 13,
                  marginBottom: 6,
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      // backgroundColor: 'white',
                      marginBottom: '1%',
                      alignSelf: 'flex-start',
                    }}>
                    Creado por:
                  </Text>
                  <Text
                    style={{
                      // backgroundColor: 'white',
                      marginBottom: '1%',
                      alignSelf: 'flex-start',
                      fontWeight: 'bold',
                    }}>
                    {project?.creator}
                  </Text>
                </View>
                <Text
                  style={{
                    // backgroundColor: 'white',
                    marginBottom: '1%',
                    alignSelf: 'flex-start',
                    fontWeight: 'bold',
                  }}>
                  {project?.name}
                </Text>
                <View style={{flexDirection: 'row'}}>
                  {hastags.map(x => {
                    return (
                      <Text
                        key={x.id}
                        style={{
                          // backgroundColor: 'white',
                          alignSelf: 'flex-start',
                          color: Colors.primaryDark,
                          marginBottom: '4%',
                        }}>
                        #{x.hasTag}
                        {'   '}
                      </Text>
                    );
                  })}
                </View>
                <Text
                  style={{
                    // backgroundColor: 'white',
                    alignSelf: 'flex-start',
                    marginBottom: '4%',
                  }}>
                  {project?.description}
                </Text>
              </View>
            </View>
          </View>

          {/* boton back */}
          <TouchableOpacity style={styles.buttonBack} onPress={onBack}>
            <Chevron
              width={RFPercentage(2.5)}
              height={RFPercentage(2.5)}
              color={'#000000'}
            />
          </TouchableOpacity>
          {/* boton edit */}
          <TouchableOpacity style={styles.buttonEdit}>
            <PencilSquare
              width={RFPercentage(2.5)}
              height={RFPercentage(2.5)}
              color={'#000000'}
            />
          </TouchableOpacity>
          {/* boton download */}
          <TouchableOpacity style={styles.buttonDownload}>
            <Download
              width={RFPercentage(2.5)}
              height={RFPercentage(2.5)}
              color={'#000000'}
            />
          </TouchableOpacity>
        </View>
        <SaveProyectModal
          visible={saveModal}
          hideModal={hideModalSave}
          onPress={hideModalSave}
          size={RFPercentage(6)}
          color={Colors.semanticSuccessLight}
          label='¡Proyecto creado!'
          subLabel='No olvides compartir tu proyecto para obtener una mayor
          participación'
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: '100%',
    height: RFPercentage(55),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    zIndex: 0,
  },
  image: {
    // width: '100%',
    // height: '100%',
  },
  textContainer: {
    position: 'absolute',
    top: RFPercentage(28),
    left: RFPercentage(5),
    right: RFPercentage(5),
    // backgroundColor: 'black',
    padding: RFPercentage(1),
    // borderRadius: 10,
    zIndex: 1,
  },
  title: {
    color: 'white',
    fontSize: RFPercentage(3.5),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  buttonBack: {
    position: 'absolute',
    top: RFPercentage(4),
    left: RFPercentage(2),
    zIndex: 999,
  },
  buttonEdit: {
    position: 'absolute',
    top: RFPercentage(4),
    right: RFPercentage(2),
    zIndex: 999,
  },
  buttonDownload: {
    position: 'absolute',
    top: RFPercentage(4),
    right: RFPercentage(7),
    zIndex: 999,
  },
});
