// jscs:disable maximumLineLength
import React from 'react';
import ReactDOM from 'react-dom';
import jsonp from 'jsonp';
import moment from 'moment';
import $ from 'jquery';

const WPM = 300;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      randomUrl: 'http://en.wikipedia.org/wiki/Special:Random',
      searchString: '',
      url: 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cinfo&generator=search&exsentences=2&exlimit=10&exintro=1&explaintext=1&gsrsearch=',
      results: [],
    };
  }

  handleSearch(query) {
    const index = this.state.url.lastIndexOf('=');
    let queryUrl = this.state.url.slice(0, index  + 1) + query;
    let lastQuery = this.state.searchString;

    if (lastQuery.toLowerCase() !== query.toLowerCase()) {
      this.makeRequest(queryUrl);
      this.setState({
        searchString: query,
        url: queryUrl,
      });
    } else {
      return false;
    }
  }

  makeRequest(url) {
    jsonp(url, null, (err, data) => {
      let pagesArr = Object.keys(data.query.pages).map(key => data.query.pages[key]);
      this.setState({
        results: pagesArr,
      });
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row search-section">
          <div className="col-sm-6 col-sm-offset-3 search-bar">
            <SearchBox onSearch={(query) => this.handleSearch(query)}/>
          </div>
          <div className="col-sm-6 col-sm-offset-3 random-button text-center">
            <RandomButton url={this.state.randomUrl}/>
          </div>
        </div>
        <div className="row display-section">
          { this.state.searchString !== ''
            ? <h2 className="text-center">Search results for: <strong>{this.state.searchString}</strong></h2>
            : <h2 className="text-center">Welcome to WikiApp</h2>
          }
          <List pages={this.state.results} />
        </div>
      </div>
    );
  }
}

const SearchBox = (props) => {
  let input;
  const setRef = (ref) => {input = ref;};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.value) {
      props.onSearch(input.value);
      input.value = '';
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} >
      <input type="search" name="q" className="search"
             placeholder="Search our Wiki App..." autoComplete="off"
             ref={(ref) => setRef(ref)}/>
      <button type="submit" className="go">
        <span className="search-icon"></span>
      </button>
      <a className="logo" href="http://huy-tran.info" target="_blank">
        <img src="https://goo.gl/YPZJEY"/>
      </a>
    </form>
  );
};

const RandomButton = (props) => {
  return <button><a href={props.url} target="_blank">Lazy Typing? Get Random</a></button>;
};

const ListItem = ({ pageid, title, extract, touched, length }) => {
  const readingTime = Math.round(length / WPM);
  const readingStatus = readingTime > 120 ? 'TL;DR' : `${readingTime} mins to read`;
  const timeFormat = touched.match(/\d{4}-\d{2}-\d{2}/);
  const lastEdit = moment(timeFormat).fromNow();
  const pageUrl = `https://en.wikipedia.org/?curid=${pageid}`;
  return (
    <div className="page">
      <div className="page-info">
        <a href={pageUrl} target="_blank">{title}</a><span><i className="fa fa-commenting"></i>{readingStatus}</span>
        <p>Last Edited: {lastEdit}</p>
      </div>
      <div className="page-desc">
        {extract}
      </div>
    </div>
  );
};

const List = ({ pages }) => {
  const items = pages.map(page => {
    return <ListItem key={page.pageid} {...page} />;
  });
  return <div className="col-sm-12 results-section">{items}</div>;
};

ReactDOM.render(<App />, document.getElementById('myApp'));
