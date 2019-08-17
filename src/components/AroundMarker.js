import React from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import PropTypes from 'prop-types';

export class AroundMarker extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
    }

    state = {
        isOpen: false,
    }

    handelToggle = () => {
        this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
    }

    render() {
        const { user, message, url, location } = this.props.post;
        const { lat, lon } = location;
        return (
            <Marker
                position={{ lat, lng:lon }}
                onMouseOver={this.handelToggle}
                onMouseOut={this.handelToggle}
            >
                {this.state.isOpen ? (
                    <InfoWindow>
                        <div>
                            <img src={url} alt={message} className="around-marker-image"/>
                            <p>{`${user}: ${message}`}</p>
                        </div>
                    </InfoWindow>
                ) : null }
            </Marker>
        );
    }
}