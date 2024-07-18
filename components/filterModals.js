import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { BlurView } from 'expo-blur';
import {
    BottomSheetModal,
    BottomSheetView,
  } from '@gorhom/bottom-sheet';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

    const FilterModals = ({modalRef}) => {
    const snapPoints = useMemo(() => ['75%'], []);

  return (
    <BottomSheetModal
          ref={modalRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backdropComponent={CustomBackdrop}
          //onChange={handleSheetChanges}
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text>Awesome 🎉</Text>
          </BottomSheetView>
    </BottomSheetModal>
  )
}

const CustomBackdrop = ({animatedIndex, style}) =>{
    
    const containerAnimatedStyle = useAnimatedStyle(()=>{
        let opacity = interpolate(
            animatedIndex.value,
            [-1, 0],
            [0,1],
            Extrapolation.CLAMP
        )
        return{
            opacity
        }
    })

    const containerStyle = [
        StyleSheet.absoluteFill,
        style,
        styles.overlay,
        containerAnimatedStyle
    ]

    return(
        <Animated.View style={containerStyle}>
                {/* Blur View */}
            <BlurView
                style={StyleSheet.absoluteFill}
                tint="dark"
                intensity={25}
            />
        </Animated.View>
    )
}

export default FilterModals

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'grey',
      },
      contentContainer: {
        flex: 1,
        alignItems: 'center',
      },
      overlay:{
        backgroundColor: 'rgba(0,0,0,0.5)',
      }
})