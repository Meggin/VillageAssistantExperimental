import React, { Component } from 'react';

class Search extends Component {
  

  constructor(props){
    super(props);

    this.state = {
      search: " ",
    };
    this.searchChange = this.searchChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  searchChange(event){
    this.setState({ search: event.target.value })
    console.log(this.state.search)
  }

  handleSubmit(event){
    event.preventDefault();
    this.props.setSearch(this.state.search);
    console.log('search', this.state.search);
    this.props.searchFirebase(this.state.search);
  }



  render(){
    return(
      <div>
        <form onSubmit={this.handleSubmit}>
          <input placeholder={this.state.search} onChange={this.searchChange}></input>
          <br />
          <button type="submit">Search</button>
        </form>
      </div>
    );
  }
}

export default Search;
