import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import parseCsv from 'csv-parse';
import {parse, differenceInDays} from 'date-fns';
import Spinner from './components/Spinner';
import {createPredictor} from './gender';
import './App.css';


export default function App() {
  const [isLoadingCsv, setIsLoadingCsv] = useState(true);
  const [csv, setCsv] = useState(null);
  const [csvError, setCsvError] = useState(null);
  
  useEffect(() => {
    fetch('/daily-inmates-in-custody.csv')
      .then(r => r.text())
      .then(csvText => {
        parseCsv(csvText, { columns: true}, (error, output) => {
          setCsvError(error);
          setCsv(output);
          setIsLoadingCsv(false);
        });
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>humanized data rendering</h1>
        {(isLoadingCsv && !csvError) ? <Spinner /> : <Stories csv={csv} />}
        {csvError && <pre>{JSON.stringify({csvError}, null, 2)}</pre>}
      </header>
    </div>
  );
}

function Stories({csv}) {
  const [record, setRecord] = useState(_.sample(csv));
  return (
    <div className="App-vertical-flex">
      <Story key={JSON.stringify(record)} record={record} />
      <button
        className="App-button"
        onClick={e => setRecord(_.sample(csv))}
      >Hear another</button>
    </div>
  );
}

function Story({record}) {
  const [imgEl, setImgEl] = useState(null);
  // const [prediction, setPrediction] = useState(null);
  const introText = `I'm ${record.AGE} years old, and I've been in jail for the last ${differenceInDays(new Date(), parse(record.ADMITTED_DT))} days.`;
  const [imageUrl, setImageUrl] = useState(`https://thispersondoesnotexist.com/image?r=${Math.random()}`);
  
  useEffect(() => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const utterThis = new SpeechSynthesisUtterance(introText);
    utterThis.voice = _.sample(voices);
    synth.speak(utterThis);
  }, [introText, record]);

  // useEffect(() => {
  //   createPredictor().then(predictFn => {
  //     const prediction = predictFn(imgEl);
  //     setPrediction(prediction);
  //   })
  // }, [imgEl]);

  //{/*<pre>{prediction && JSON.stringify(prediction, null, 2)}</pre>*/}
  return (
    <div className="Story">
      <div className="Story-rendering">
        <div>{introText}</div>
        <img
          key={imageUrl}
          ref={el => setImgEl(el)}
          alt="face"
          src={imageUrl}
          style={{margin: 20}}
          width="300"
          height="300"
        />
        {record.SRG_FLG === 'N' && <div>I've never been involved with a gang.</div>}
        <div>In prison I'm #{record.INMATEID}.</div>
      </div>
      <div className="Story-source">
        <pre style={{background: 'black', color: 'lightgreen', padding: 20, marginLeft: 20, fontSize: 12}}>{JSON.stringify(record, null, 2).slice(1, -1)}</pre>
        <div style={{fontSize: 10, color: '#aaa'}}>
        <div>Raw data from <a href="https://www.kaggle.com/new-york-city/ny-daily-inmates-in-custody">City of New York</a></div>
          <div>Images from <a href="https://thispersondoesnotexist.com">thispersondoesnotexist.com</a></div>
          <div>Text is generated from data, written by <a href="https://github.com/kevinrobinson">Kevin Robinson</a></div>
        </div>
      </div>
    </div>
  );
}

/*
INMATE_STATUS_CODE
  CS= City Sentenced
  CSP= City Sentenced - with VP Warrant
  DE= Detainee
  DEP= Detainee - with Open Case & VP Warrant
  DNS= Detainee- Newly Sentenced to State Time
  DPV= Detainee- Technical Parole Violator
  SCO= State Prisoner- Court Order
  SSR= State Ready
*/