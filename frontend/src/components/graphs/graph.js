import React, {Component, PureComponent} from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './graph.css';

class Graph extends PureComponent {
    static jsfiddleUrl = 'https://jsfiddle.net/alidingling/30763kr7/';

    constructor() {
        super();
        this.state = {
            customers: [],
            daysInAugust: [],
            filteredDaysInAugust: [],
            bfilteredDaysInAugust: [],
            startDate: new Date("8/1/2020"),
            endDate: new Date("8/31/2020"),
            averageBreakfastTTS: 0,
            averageLunchTTS: 0,
            averageDinnerTTS: 0,
            dayPart: "all-day"
        }

        this.handleAugust = this.handleAugust.bind(this)
        this.ttsGraph = this.ttsGraph.bind(this)
        this.customersGraph = this.customersGraph.bind(this)
        this.bCustomersGraph = this.bCustomersGraph.bind(this)
        this.lCustomersGraph = this.lCustomersGraph.bind(this)
        this.dCustomersGraph = this.dCustomersGraph.bind(this)
        this.breakfastTTSGraph = this.breakfastTTSGraph.bind(this)
        this.lunchTTSGraph = this.lunchTTSGraph.bind(this)
        this.allTTSGraph = this.allTTSGraph.bind(this)
        this.allCustomersGraph = this.allCustomersGraph.bind(this)
        this.filterDate = this.filterDate.bind(this)
        this._onSelect = this._onSelect.bind(this)
        // this.timeGraph = this.timeGraph.bind(this)
    }

    async componentDidMount() {
        await fetch('/api/customers')
            .then(res => res.json())
            .then(customers => this.setState({customers: customers}, () => console.log('customers fetched...')))

        await this.handleAugust()
        await this.filterDate()
    }

    _onSelect(option) {
        this.setState({dayPart: option.value})
    }

    handleAugust() {
        const breakfastCustomers = []
        const lunchCustomers = []
        const dinnerCustomers = []

        
        const daysInAugust = new Map();

        this.state.customers.forEach(customer => {
            let day = new Date(customer.first_seen_utc*1000).getDate();
            let date = new Date(customer.first_seen_utc*1000);
            const time = moment(date).format("h:mm a")

            let tts = parseInt(customer.tts)
            let dayPart = parseInt(customer.day_part)

            if (daysInAugust.has(day)) {
                let dayObj = daysInAugust.get(day);
                dayObj.totaltts += tts
                dayObj.customers++
                dayObj.averagetts = (dayObj.totaltts / dayObj.customers / 60).toFixed(2)
                daysInAugust.set(day, dayObj);
            } else {
                let dayObj = {
                    utc: customer.first_seen_utc,
                    day,
                    time, 
                    customers: 1,
                    totaltts: tts,
                    averagetts: tts,
                    //breakfast
                    btotaltts:0,
                    bcustomers:0,
                    baveragetts: 0,
                    //lunch
                    ltotaltts:0,
                    lcustomers:0,
                    laveragetts: 0,
                    //dinner
                    dtotaltts:0,
                    dcustomers:0,
                    daveragetts: 0
                }
                daysInAugust.set(day, dayObj);
            }

            if (customer.day_part == 1) {
                breakfastCustomers.push(customer)
                let dayObj = daysInAugust.get(day)
                dayObj.bcustomers++
                dayObj.btotaltts += tts
                dayObj.baveragetts = (dayObj.btotaltts / dayObj.bcustomers / 60).toFixed(2)
                daysInAugust.set(day, dayObj);
            } else if (customer.day_part == 2) {
                lunchCustomers.push(customer)
                let dayObj = daysInAugust.get(day)
                dayObj.lcustomers++
                dayObj.ltotaltts += tts
                dayObj.laveragetts = (dayObj.ltotaltts / dayObj.lcustomers / 60).toFixed(2)
                daysInAugust.set(day, dayObj);
            } else if (customer.day_part == 3) {
                dinnerCustomers.push(customer)
                let dayObj = daysInAugust.get(day)
                dayObj.dcustomers++
                dayObj.dtotaltts += tts
                dayObj.daveragetts = (dayObj.dtotaltts / dayObj.dcustomers / 60).toFixed(2)
                daysInAugust.set(day, dayObj);
            }
        })


        const daysInAugustArr = Array.from(daysInAugust.values());
        this.setState({daysInAugust: daysInAugustArr})


        //BREAKFAST
        const numBreakfastCustomers = breakfastCustomers.length

        let totalBreakfastTTS = 0;
        breakfastCustomers.forEach(customer => {
            totalBreakfastTTS += parseInt(customer.tts)
        })

        let averageBreakfastTTS = totalBreakfastTTS / numBreakfastCustomers

        //LUNCH
        const numLunchCustomers = lunchCustomers.length

        let totalLunchTTS = 0;
        lunchCustomers.forEach(customer => {
            totalLunchTTS += parseInt(customer.tts)
        })

        let averageLunchTTS = totalLunchTTS / numLunchCustomers


        //DINNER
        const numDinnerCustomers = dinnerCustomers.length

        let totalDinnerTTS = 0;
        dinnerCustomers.forEach(customer => {
            totalDinnerTTS += parseInt(customer.tts)
        })

        let averageDinnerTTS = totalDinnerTTS / numDinnerCustomers
        

        // return (
        //     <div>
        //         <h1>August</h1>
        //         <h2>Average Breakfast Time To Service: {(averageBreakfastTTS/60).toFixed(1)} min</h2>
        //         <h2>Average Lunch Time To Service: {(averageLunchTTS/60).toFixed(1)} min</h2>
        //         <h2>Average Dinner Time To Service: {(averageDinnerTTS/60).toFixed(1)} min</h2>
        //     </div>
        // )
    }

    filterDate() {
        if (this.state.daysInAugust < 1) {
            return null
        }

        const filteredDaysInAugust = []
        this.state.daysInAugust.forEach((dayObj) => {
            let date = new Date(dayObj.utc*1000)

            const endDate = moment(this.state.endDate)
            endDate.add(1, 'days')

            if (date >= this.state.startDate && date <= endDate) {
                filteredDaysInAugust.push(dayObj)
            }
        })

        this.setState({filteredDaysInAugust: filteredDaysInAugust})
    }

    filterByDayPart() {
        if (this.state.daysInAugust < 1) {
            return null
        }

        const bfilteredDaysInAugust = []
        const lfilteredDaysInAugust = []
        const dfilteredDaysInAugust = []

        this.state.daysInAugust.forEach((dayObj) => {
            let date = new Date(dayObj.utc*1000)

        })
    }

    ttsGraph() {
        if (this.state.dayPart == "all-day") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40
                    }}
                >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                
                    <YAxis dataKey="averagetts" textAnchor="middle" label={{ value: 'Average TTS (min)', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50}}/> 
                    <Tooltip />
                    <Bar dataKey="averagetts" fill="#8884d8" />
                </BarChart>
            );
        }
    }

    customersGraph() {
        if (this.state.dayPart == "all-day") {
            return (
                // <ResponsiveContainer width={500} height="40%">
                    <BarChart
                        width={675}
                        height={500}
                        data={this.state.filteredDaysInAugust}
                        margin={{
                        top: 40, right: 40, left: 40, bottom: 40
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                        <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                    
                        <YAxis dataKey="customers" label={{ value: 'Number of customers per day', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                        <Tooltip />
                        <Bar dataKey="customers" fill="#8884d8" />
                    </BarChart>
            );
        }
    }

    bCustomersGraph() {
        if (this.state.dayPart == "breakfast") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                
                    <YAxis dataKey="bcustomers" label={{ value: 'Number of customers at breakfast', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                    <Tooltip />
                    <Bar dataKey="bcustomers" fill="#8884d8" />
                </BarChart>
            );
        }
    }

    lCustomersGraph() {
        if (this.state.dayPart == "lunch") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                
                    <YAxis dataKey="lcustomers" label={{ value: 'Number of customers at lunch', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                    <Tooltip />
                    <Bar dataKey="lcustomers" fill="#8884d8" />
                </BarChart>
            );
        }
    }

    dCustomersGraph() {
        if (this.state.dayPart == "dinner") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                
                    <YAxis dataKey="dcustomers" label={{ value: 'Number of customers at dinner', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                    <Tooltip />
                    <Bar dataKey="dcustomers" fill="#8884d8" />
                </BarChart>
            );
        }
    }

    breakfastTTSGraph() {
        if (this.state.dayPart == "breakfast") {
            return (
                <BarChart
                    className="bar-chart"
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white' }}/>
                
                    <YAxis dataKey="baveragetts" label={{ value: 'Average TTS (min) at breakfast', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                    <Tooltip />
                    <Bar dataKey="baveragetts" fill="#8884d8" />
                </BarChart>
            );
        }
    }

    lunchTTSGraph() {
        if (this.state.dayPart == "lunch") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                
                    <YAxis dataKey="laveragetts" label={{ value: 'Average TTS (min) at lunch', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                    <Tooltip />
                    <Bar dataKey="laveragetts" fill="#8884d8" />
                </BarChart>
            );
        }
    }

    dinnerTTSGraph() {
        if (this.state.dayPart == "dinner") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                
                    <YAxis dataKey="daveragetts" label={{ value: 'Average TTS (min) at dinner', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                    <Tooltip />
                    <Bar dataKey="daveragetts" fill="#8884d8" />
                </BarChart>
            );
        }
    }

    allCustomersGraph() {
        if (this.state.dayPart == "split") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'  }}/>
                
                    <YAxis dataKey="lcustomers" label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50  }}/> 
                    <Tooltip />
                    <Bar dataKey="bcustomers" fill="#8884d8" />
                    <Bar dataKey="lcustomers" fill="#F093DB" />
                    <Bar dataKey="dcustomers" fill="#6DE0E8" />
                </BarChart>
            );
        }
    }

    allTTSGraph() {
        if (this.state.dayPart == "split") {
            return (
                <BarChart
                    width={675}
                    height={500}
                    data={this.state.filteredDaysInAugust}
                    margin={{
                    top: 40, right: 40, left: 40, bottom: 40,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false}/>
                    <XAxis dataKey="day" interval={0} label={{ value: 'Days in August', angle: 0, position: 'bottom', fill: 'white'   }}/>
                
                    <YAxis dataKey="daveragetts" label={{ value: 'Average TTS (min)', angle: -90, position: 'insideLeft', fill: 'white',  dy: 50   }}/> 
                    <Tooltip />
                    {/* <Legend verticalAlign="top" height={36}/> */}
                    <Bar dataKey="baveragetts" fill="#8884d8" />
                    <Bar dataKey="laveragetts" fill="#F093DB" />
                    <Bar dataKey="daveragetts" fill="#6DE0E8" />
                </BarChart>
            );
        }
    }

    // timeGraph() {
    //     return (
    //         <BarChart
    //             width={900}
    //             height={500}
    //             data={this.state.filteredDaysInAugust}
    //             margin={{
    //             top: 20, right: 30, left: 20, bottom: 30,
    //             }}
    //         >
    //             <CartesianGrid strokeDasharray="3 3" />
    //             <XAxis dataKey="day" label={{ value: 'Days in August', angle: 0, position: 'bottom' }}/>
            
    //             <YAxis dataKey="time" label={{ value: 'Time of day', angle: -90, position: 'insideLeft' }}/> 
    //             <Tooltip />
    //             <Legend verticalAlign="top" height={36}/>
    //             <Bar dataKey="time" fill="#8884d8" />
    //         </BarChart>
    //     );
    // }

    async setStartDate(date) {
        await this.setState({startDate: date})
        this.filterDate()
    }

    async setEndDate(date) {
        await this.setState({endDate: date})
        this.filterDate()
    }

    render() {

        if (this.state.customers.length < 1) {
            return null
        }

        if (this.state.daysInAugust.length < 1) {
            return null
        }

        const options = [
            'all-day', 'split', 'breakfast', 'lunch', 'dinner'
            ];
        const defaultOption = options[0];

        let firstCustomer = this.state.customers[0]
        let test = parseInt(new Date(firstCustomer.first_seen_utc*1000).toString().slice(8,11))

        console.log(this.state.filteredDaysInAugust)
        console.log(this.state.dayPart)

        return (
            <div>
                <div className="buttons">
                    <div>
                        <div className="start-date">START DATE</div>
                        <DatePicker className="input-box" selected={this.state.startDate} onChange={date => this.setStartDate(date)} />
                    </div>
                    <div>
                        <div className="day-part">END DATE</div>
                        <DatePicker className="input-box" selected={this.state.endDate} onChange={date => this.setEndDate(date)} />
                    </div>
                    <div >
                        <div className="day-part">DAY PART</div>
                        <Dropdown className="dropdown" options={options} onChange={this._onSelect} value={defaultOption} placeholder="Select an option" />
                    </div>
                </div>
                <div className="graphs">
                    <div className="graph">{this.ttsGraph()}</div>
                    <div className="graph">{this.breakfastTTSGraph()}</div>
                    <div className="graph">{this.lunchTTSGraph()}</div>
                    <div className="graph">{this.dinnerTTSGraph()}</div>
                    <div className="graph">{this.customersGraph()}</div>
                    <div className="graph">{this.bCustomersGraph()}</div>
                    <div className="graph">{this.lCustomersGraph()}</div>
                    <div className="graph">{this.dCustomersGraph()}</div>
                    <div className="graph">{this.allTTSGraph()}</div>
                    <div className="graph">{this.allCustomersGraph()}</div>
                </div>
            </div>
            );
    }   
}

export default Graph;
