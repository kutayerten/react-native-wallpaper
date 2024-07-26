import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Categories from '../../components/categories';
import { apiCall } from '../../api';
import ImageGrid from '../../components/imageGrid';
import {debounce} from 'lodash';
import FilterModals from '../../components/filterModals';

let page = 1;

const HomeScreen = () => {
    const {top} = useSafeAreaInsets();
    const paddingTop = top > 0? top+10: 30;
    const [search,setSearch] = useState('');
    const [images, setImages] = useState([]);
    const [filters,setFilters] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const searchInputRef = useRef(null);
    const modalRef = useRef(null);
    const scrollRef = useRef(null);
    const [isEndReached, setIsEndReached] = useState(false);

    useEffect( () =>{
        fetchImages();
    },[]);

    const fetchImages = async (params ={page:1}, append=true) => {
        console.log('params', params, append);
        let res = await apiCall(params);
        if(res.success && res?.data?.hits){
            if(append)
            setImages([...images , ...res.data.hits])
            else
            setImages([...res.data.hits])
        }
    }

    const openFilterModals = () =>{
        modalRef?.current?.present();
    }
    const closeFilterModals = () =>{
        modalRef?.current?.close();
    }

    const applyFilters = () => {
        if(filters){
            page= 1;
            setImages([]);
            let params = {
                page,
                ...filters
            }
            if(activeCategory) params.category = activeCategory;
            if(search) params.q = search;
            fetchImages(params,false);
        }
        closeFilterModals();
    }

    const resetFilters = () => {
        console.log('resetting filters');
        setFilters(null);
        closeFilterModals();
    }

    const clearThisFilter = (filterName) =>{
        let filterz = {...filters};
        delete filterz[filterName];
        setFilters({...filterz});
        page = 1;
        setImages([]);
        let params = {
            page,
            ...filterz
        }
        if(activeCategory) params.category = activeCategory;
        if(search) params.q = search;
        fetchImages(params,false);
    }

    const handleChangeCategory = (cat) => {
        setActiveCategory(cat);
        clearSearch();
        setImages([]);
        page = 1;
        let params = {
            page,
        }
        if(cat) params.category= cat;
        fetchImages(params, false);
    }

    const handleSearch = (text) =>{
        setSearch(text);
        if(text.length>2){
            //search for this text
            page =1;
            setImages([]);
            setActiveCategory(null);// clear category when searching
            fetchImages({page, q:text}, false);
        }

        if(text==""){
            //reset results
            page =1;
            searchInputRef?.current?.clear();
            setImages([]);
            setActiveCategory(null); // clear category when searching
            fetchImages({page}, false);
        }
    }

    const clearSearch = ()=>{
        setSearch("");
        searchInputRef?.current?.clear();
        
    }

    const handleScroll = (event) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
        const scrollOffset = event.nativeEvent.contentOffset.y;
        const bottomPosition = contentHeight - scrollViewHeight;

        if(scrollOffset>=bottomPosition-1){
            if(!isEndReached){
                setIsEndReached(true);
                console.log('reaced the bottom of scroll view');
                ++page;
                let params = {
                    page,
                    ...filters
                }
                if(activeCategory) params.category= activeCategory;
                if(search) params.q = search;
                fetchImages(params);
            }
        }else if (isEndReached){
            setIsEndReached(false);
        }
    }

    const handleScrollUp = () => {
        scrollRef?.current?.scrollTo({
            y:0,
            animated:true,
        })
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

    //console.log('filters', filters);

    return (
    <View style={[styles.container, {paddingTop}]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={handleScrollUp}>
            <Text style={styles.title}>
                Erten
            </Text>
        </Pressable>
        <TouchableOpacity onPress={openFilterModals}>
            <FontAwesome6 name='bars-staggered' size={32} color={theme.colors.neutral(0.7)} />
        </TouchableOpacity>
      </View>

      <ScrollView 
      onScroll={handleScroll}
      scrollEventThrottle={5}//how often scroll event fire whiel scrolling in ms
      ref={scrollRef}
      contentContainerStyle={{gap:15}}>
        {/* search bar */}
        <View style={styles.searchBar}>
            <View style={styles.searchIcon}>
                <Feather name='search' size={24} color={theme.colors.neutral(0.4)} />
            </View>
            <TextInput 
                placeholder='Search for photos...'
                //value={search}
                ref={searchInputRef}
                onChangeText={handleTextDebounce}
                style={styles.searchInput} />
            {
                search && (
                    <Pressable onPress={() => handleSearch("")} style={styles.closeIcon}>
                        <Ionicons name="close" size={24} color={theme.colors.neutral(0.6)} />
                    </Pressable>
                )
            }
        </View>
        {/* categories */}
        <View style={styles.categories}>
            <Categories activeCategory={activeCategory} handleChangeCategory={handleChangeCategory} />
        </View> 

            {/* Filters */}
            {
                filters && (
                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                            {
                                Object.keys(filters).map((key,index)=>{
                                    return(
                                        <View key={key} style={styles.filterItem}>
                                            {
                                                key =='colors'?(
                                                    <View style={{
                                                        height : 20,
                                                        width: 30,
                                                        borderRadius:7,
                                                        backgroundColor:filters[key] }} />
                                                ) : (
                                                    <Text style={styles.filterItemText}>{filters[key]}</Text>
                                                )
                                            }
                                            <Text style={styles.filterItemText}>{filters[key]}</Text>

                                            <Pressable style={styles.filterCloseIcon} onPress={()=> clearThisFilter(key)}>
                                            <Ionicons name="close" size={24} color={theme.colors.neutral(0.9)} />
                                            </Pressable>
                                        </View>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                )
            }

        {/* images masanory grid */}
            <View>
                {
                    images.length>0 && <ImageGrid images={images} />
                }
            </View>

            {/*Loading */}
            <View style={{marginBottom:70, marginTop:images.length > 0? 10 : 70}}>
                <ActivityIndicator size='large' />
            </View>
      </ScrollView>
       {/* Filters Modal */}
     <FilterModals 
        modalRef={modalRef}
        filters={filters}
        setFilters={setFilters}
        onClose={closeFilterModals}
        onApply={applyFilters}
        onReset={resetFilters}
     />
     </View>
    
  )
}

export default HomeScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        gap:15,
    },
    header:{
        marginHorizontal: wp(4),
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },
    title:{
        fontSize: hp(4),
        fontWeight: theme.fontWeights.semibold,
        color:theme.colors.neutral(0.9),
    },
    searchBar:{
        marginHorizontal: wp(4),
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderWidth:1,
        borderColor: theme.colors.grayBG,
        backgroundColor:theme.colors.white,
        padding:6,
        paddingLeft:10,
        borderRadius:theme.radius.lg,
    },
    searchIcon:{
        padding:8,
    },
    searchInput:{
        flex:1,
        borderRadius:theme.radius.sm,
        paddingVertical:10,
        fontSize: hp(1.8),
    },
    closeIcon:{
        backgroundColor:theme.colors.neutral(0.1),
        padding:8,
        borderRadius:theme.radius.sm,
    },
    filters:{
        paddingHorizontal:wp(4),
        gap:10,
    },
    filterItem:{
        backgroundColor: theme.colors.grayBG,
        padding:3,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.radius.xs,
        padding:8,
        gap:10,
        paddingHorizontal: 10,
    },
    filterItemText:{
        fontSize: hp(1.9),
    },
    filterCloseIcon:{
        backgroundColor:theme.colors.neutral(0.2),
        padding:4,
        borderRadius:7, 
    }
})