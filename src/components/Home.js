import React from 'react';
import { Tabs, Button, Spin } from 'antd';
import { API_ROOT, TOKEN_KEY, GEO_OPTIONS, POS_KEY, AUTH_HEADER } from '../constants';
import { Gallery } from './Gallery';

const TabPane = Tabs.TabPane;


export class Home extends React.Component{
    state = {
        isLoadingGeoLocation: false,
        error: '',
        isLoadingPosts: false,
        posts: [],
    }

    componentDidMount(){
        if ("geolocation" in navigator) {
            this.setState({ 
                isLoadingGeoLocation: true,
                error: ''});
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS);  
        } else {
            this.setState({
                error: 'Geolocation is not supported.'
            })
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({
            lat: latitude,
            lon: longitude
        }));
        this.setState({
            isLoadingGeoLocation: false,   
        });
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = () => {
        console.log("Failed to load geolocation.");
        this.setState({
            isLoadingGeoLocation: false,
            error: 'Failed to load geolocation.'
        });
    }

    loadNearbyPosts = () => {
        const { lat, lon } = JSON.parse( localStorage.getItem(POS_KEY));
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({
            isLoadingPosts: true,
            error: ''
        });
        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`, 
            {
                method: 'GET',
                headers: { Authorization: `${AUTH_HEADER} ${token}` },
            }
        )
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts.');
        })
        .then((data)=>{
            console.log(data);
            this.setState({
                isLoadingPosts: false,
                posts: data ? data : []
            });
        })
        .catch( (e) => {
            console.log(e.message);
            this.setState({
                error: e.message
            });
        });
    }

    getImagePosts = () => {
        const { isLoadingGeoLocation, isLoadingPosts, error, posts } = this.state;
        if (error) {
            return <div>{error}</div>
        } else if (isLoadingGeoLocation) {
            return <Spin tip="Loading your geo location..."/>
        } else if (isLoadingPosts) {
            return <Spin tip="Loading your nearby posts..."/>
        } else if (posts.length>0) {
            console.log(posts);
            const images = this.state.posts.map( (post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                }
            });
            return (<Gallery images={images}/>);
        } else {
            return 'No nearby posts found.';
        }
    }
      
    render() {
        const operations = <Button type="primary">Create New Post</Button>
        return (
            <Tabs tabBarExtraContent={operations} className="main-tabs"> 
                <TabPane tab="Image Posts" key="1">{this.getImagePosts()}</TabPane>
                <TabPane tab="Video Posts" key="2">Content of Tab 2</TabPane>
                <TabPane tab="Map" key="3">Content of Tab 3</TabPane>
            </Tabs>
        )
    }
}