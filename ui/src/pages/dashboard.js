import { h, Component } from 'preact';
import { settings } from '../lib/settings';
import { loadDevices } from '../lib/espeasy';

export class DashboardPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: settings.get('plugins').filter(p => p && p.enabled),
            deviceState: [],
        }

        this.renderSwitch = (device, deviceState) => {
            const state = deviceState[device.state.values[0].name];
            const buttonClick = async () => {
                await fetch(`/plugin/${device.id}/state/0/${state ? 0 : 1}`);
                // deviceState[device.state.values[0].name] = !state;
                // this.forceUpdate(); 
            }
            return (
                <div className='media device'>
                   <div class="media-left">
                        <p class="image is-64x64">
                            <span class={device.icon} />
                        </p>
                    </div>
                    <div class="media-content">
                        <div class='info'>
                            {device.name}
                        </div>
                    </div>
                    <div class="media-right">
                        <button class="button" onClick={buttonClick}>{!state ? 'ON' : 'OFF'}</button>
                    </div>
                </div>
            );
        };
// TODO: we should have a generic way to access device values
        this.renderSensor = (device, deviceState) => {
            return (
                <div className='media device'>
                    <div class="media-left">
                        <p class="image is-64x64">
                            <span class={device.icon} />
                        </p>
                    </div>
                    <div class="media-content">
                        <div class='info'>
                            {device.name}
                            <span>
                                
                            {device.state && device.state.values.map((value, i) => {
                                return (<div>{value.name}: {deviceState[value.name]} </div>);
                            })}
                            </span>
                        </div>
                    </div>
                </div>
            );
        };

        this.renderRegulator = (device, deviceState) => {
            const rangeChange = async (e) => {
                const plugins = settings.get('plugins');
                plugins.find(p => p.id == device.id).params.level = e.currentTarget.value;
                await fetch(`/plugin/${device.id}/config/level/${e.currentTarget.value}`);
            };

            return (
            <div className='media device'>
                <div class="media-left">
                    <p class="image is-64x64">
                        <span class={device.icon} />
                    </p>
                </div>
                <div class="media-content">
                    <div class='info'>
                    {device.name}<span><input width='200px' type='range' value={device.params.level} onChange={rangeChange}/></span>
                    </div>
                </div>
            </div>);
        };

        this.renderDevice = (device, deviceState) => {
            switch (device.type) {
                case 1: return this.renderSwitch(device, deviceState);
                case 2: case 3: case 4: case 6: case 12:
                        return this.renderSensor(device, deviceState);
                case 5: return this.renderRegulator(device, deviceState);
                
                default:
                    return (null);
            }
        };
    }

    render(props) {
        return (
            <div>
                {this.state.devices.map((device, i) => {
                    return this.renderDevice(device, this.state.deviceState[device.id] || {});
                })}
            </div>
        );
    }

    fetchDevices() {
        loadDevices().then(deviceState => {
            this.setState({ deviceState });
            if (!this.shutdown)
                setTimeout(() => {
                    this.fetchDevices();
                }, 1000);
        });
        
    }

    componentDidMount() {
        this.fetchDevices();
    }

    componentWillUnmount() {
        this.shutdown = true;
    }
}