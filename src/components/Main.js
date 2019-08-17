import React from 'react'
import { Register } from './Register';
import { Login } from './Login';
import { Home } from './Home';
import { Switch, Route, Redirect } from 'react-router';

export class Main extends React.Component{
    getLogin = () => {
        return this.props.isLoggedIn ? <Redirect to="/home"/> : <Login handleLoginSucceed={this.props.handleLoginSucceed}/>
    }
    
    getHome = () => {
        return this.props.isLoggedIn ? <Home/> : <Redirect to="/login"/>
    }

    render(){
        return (
            <div className="main">
                <Switch>
                    <Route exact path="/" component={this.getLogin}/>
                    <Route path="/login" component={this.getLogin}/>
                    <Route path="/register" component={Register}/>
                    <Route path="/home" component={this.getHome}/>
                    <Route component={this.getLogin}/>
                </Switch>
            </div>
        )
    }
}