import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { Button } from './Button/Button';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Loader } from './Loader/Loader';
import { Searchbar } from './Searchbar/Searchbar';
import { searchImages } from '../services/api';
import css from './Container.module.css';

export class App extends Component {
  state = {
    images: [],
    page: 1,
    query: '',
    totalHits: 0,
    onClick: false,
    isLoading: false,
    error: '',
  };

  componentDidUpdate(_, prevState) {
    const { query, page, error } = this.state;
    if (prevState.query !== query || prevState.page !== page) {
      this.getImages();
    }

     if (prevState.error !== error && error) {
       toast.error(error);
     }
  }

  getImages = async () => {
    const { query, page } = this.state;
    try {
      this.setState({ isLoading: true });
      const { images, totalHits } = await searchImages(query, page);
      if (!images.length) {
        this.setState({ error: 'There are no images matching your request.' });
        return;
      }
      this.setState(prevState => ({
        images: [...prevState.images, ...images],
        error: '',
        totalHits,
      }));
    } catch (error) {
      this.setState({ error: 'Oops. Something went wrong, try again'});
    } finally {
      this.setState({ isLoading: false });
    }
  };

  getQuery = query => {
    if (!query.trim || query === this.state.query) {
      this.setState({ error: 'Please, change your request' });
      return;
    }
    this.setState({
      query,
      page: 1,
      images: [],
      totalHits: 0,
    });
  };

  loadMore = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };

  render() {
    const {
      images,
      isLoading,
      error,
      totalHits} = this.state;
    return (
      <section className={css.container}>
        <Searchbar onSubmit={this.getQuery} />
        {images.length !== 0 && <ImageGallery images={images} onClick={this.onClick}/>}
        {!isLoading && images.length === 0 && !error && (
          <p>There are no images.</p>
        )}
       {error && <p>{error}</p>}
        {!isLoading && totalHits !== images.length && (
          <Button type="button" onClick={this.loadMore}> Load more </Button>
        )}
        {isLoading && <Loader />}
      </section>
    );
  }
}
