import { Card, Row, Col, Popover } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSymbol } from 'utils/getContractAddress';
import imgNotFound from 'Assets/notfound.png';
import sampleAbiERC1155 from 'Contracts/SampleERC1155.json';
import abiERC721 from 'Contracts/ERC721.json';
import { getCollection } from 'store/actions';
import store from 'store/index';
import moment from 'moment';

import tick from 'Assets/icons/tick-green.svg';
import './index.scss';
import 'Assets/css/common-card-nft.scss';
import { handleChildClick, getTokenUri, objToString } from 'utils/helper';
import { BottomScrollListener } from 'react-bottom-scroll-listener';

function NFTsCard({ token, strSearch }) {
  const { web3, chainId, verifiedContracts, infoCollections } = useSelector((state) => state);
  const [detailNFT, setDetailNFT] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!!token) {
        try {
          let tokenURI;
          if (token.is1155) {
            const nft = new web3.eth.Contract(sampleAbiERC1155.abi, token.addressToken);
            tokenURI = await nft.methods.uri(token.index).call();
          } else {
            const nft = new web3.eth.Contract(abiERC721.abi, token.addressToken);
            tokenURI = await nft.methods.tokenURI(token.index).call();
          }
          let req = await getTokenUri(tokenURI);
          const data = req.data;

          token.attributes = !!data.attributes ? data.attributes : null;

          setDetailNFT({
            name: !!data.name ? data.name : 'ID: ' + token.index,
            description: !!data.description ? data.description : '',
            image: !!data.image ? data.image : imgNotFound,
          });
        } catch (error) {
          setDetailNFT({ name: 'Unnamed', description: '', image: imgNotFound });
        }
        token.nameCollection = (
          await store.dispatch(getCollection(token.addressToken, null))
        ).collection.name;
      } else {
        setDetailNFT({ name: '', description: '', image: imgNotFound });
      }
    }
    fetchDetail();
  }, [token, web3, chainId, infoCollections]);

  const _strSearch = strSearch.toLowerCase();
  const visible =
    !!detailNFT &&
    !!detailNFT.name &&
    (detailNFT.name.toLocaleLowerCase().includes(_strSearch) ||
      token.nameCollection.toLocaleLowerCase().includes(_strSearch));

  return detailNFT !== null ? (
    <>
      {!visible ? null : (
        <Col
          className='gutter-row'
          xs={{ span: 24 }}
          sm={{ span: 12 }}
          md={{ span: 8 }}
          lg={{ span: 8 }}
          xl={{ span: 6 }}
          xxl={{ span: 6 }}
        >
          <Link
            to={`/token/${chainId}/${token.addressToken}/${token.index}/${token.sellId}`}
            target='_blank'
          >
            <Card
              hoverable
              cover={
                <div className='wrap-cover'>
                  <div
                    className='blurred-background'
                    style={{ backgroundImage: `url(${detailNFT.image})` }}
                  />
                  <div className='NFTResource-Wrapper'>
                    <img
                      alt={`img-nft-${token.index}`}
                      src={detailNFT.image}
                      className='display-resource-nft'
                    />
                  </div>
                </div>
              }
              className='card-nft'
            >
              {!!token.attributes && (
                <Popover
                  onClick={handleChildClick}
                  placement='bottomLeft'
                  content={token.attributes.map((attr, i) => (
                    <div key={i} onClick={handleChildClick}>
                      <strong>{attr.trait_type}</strong>:
                      {!!attr.display_type &&
                      attr.display_type.toLowerCase() === 'date' &&
                      !!moment(attr.value).isValid()
                        ? moment(
                            attr.value.toString().length < 13 ? attr.value * 1000 : attr.value
                          ).format('DD-MM-YYYY')
                        : typeof attr.value === 'object'
                        ? objToString(attr.value)
                        : attr.value}
                    </div>
                  ))}
                >
                  <div className='attribs-nft' onClick={handleChildClick}>
                    Stats
                  </div>
                </Popover>
              )}
              {!!token.price && (
                <div className='price-nft textmode'>
                  <span>{web3.utils.fromWei(token.price, 'ether')}</span>{' '}
                  <b>{getSymbol(chainId)[token.tokenPayment]}</b>
                </div>
              )}
              <Row justify='space-between'>
                <Col className='footer-card-left'>
                  <div className='name-collection'>
                    <Link
                      to={`/collection/${chainId}/${token.addressToken}`}
                      className='link-collection-name'
                      tag='span'
                    >
                      {token.nameCollection}
                    </Link>
                    {verifiedContracts.includes(token.addressToken.toLocaleLowerCase()) && (
                      <img src={tick} alt='icon-tick' className='icon-tick' />
                    )}{' '}
                  </div>
                  <div className='name-nft textmode'>{detailNFT.name}</div>
                </Col>
              </Row>
            </Card>
          </Link>
        </Col>
      )}
    </>
  ) : (
    <Col
      className='gutter-row'
      xs={{ span: 24 }}
      sm={{ span: 12 }}
      md={{ span: 8 }}
      lg={{ span: 8 }}
      xl={{ span: 6 }}
      xxl={{ span: 6 }}
    >
      <Card
        className='card-nft card-nft-content-loader'
        cover={
          <div className='wrap-cover'>
            <div className='NFTResource-Wrapper'>
              <img
                className='display-resource-nft'
                src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
                alt=''
              />
            </div>
          </div>
        }
      >
        <Row justify='space-between'>
          <Col className='footer-card-left'>
            <div className='name-collection'>&nbsp;</div>
            <div className='name-nft'>&nbsp;</div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
}

export default function NFTsCardBrowse({
  tokens,
  tokenPayment,
  typeSort,
  filterCountCallback,
  strSearchInCollection,
}) {
  const { strSearch, web3 } = useSelector((state) => state);

  const [afterFilter, setAfterFilter] = useState(!!tokens ? tokens : []);
  const [cardsPaginated, setCardsPaginated] = useState({ cards: [], indexEnd: 0 });

  useEffect(() => {
    filterCountCallback(afterFilter.length);
  }, [afterFilter.length, filterCountCallback]);

  const sortOrders = useCallback(async () => {
    var BN = web3.utils.BN;
    let filterByTokenPayment =
      tokenPayment === '0' ? tokens : tokens.filter((order) => order.tokenPayment === tokenPayment);
    switch (typeSort) {
      case 'recentlyListed':
        setAfterFilter(filterByTokenPayment);
        break;
      case 'latestCreated':
        setAfterFilter(
          filterByTokenPayment.sort((a, b) =>
            a.sortIndex < b.sortIndex ? 1 : a.sortIndex > b.sortIndex ? -1 : 0
          )
        );
        break;
      case 'priceAsc':
        setAfterFilter(
          filterByTokenPayment.sort((a, b) =>
            !new BN(a.price).gt(new BN(b.price)) ? 1 : new BN(a.price).gt(new BN(b.price)) ? -1 : 0
          )
        );
        break;
      case 'priceDesc':
        setAfterFilter(
          filterByTokenPayment.sort((a, b) =>
            new BN(a.price).gt(new BN(b.price)) ? 1 : !new BN(a.price).gt(new BN(b.price)) ? -1 : 0
          )
        );
        break;
      default:
        break;
    }
  }, [tokens, tokenPayment, typeSort, web3]);

  useEffect(() => {
    if (tokens) sortOrders();
  }, [tokens, sortOrders]);

  const setPaginationDefault = useCallback(async () => {
    setCardsPaginated({
      cards: afterFilter.slice(0, 20),
      indexEnd: afterFilter.slice(0, 20).length > 0 ? afterFilter.slice(0, 20).length - 1 : 0,
    });
  }, [afterFilter]);

  useEffect(() => {
    if (afterFilter.length > 0) setPaginationDefault();
  }, [setPaginationDefault, afterFilter, tokens]);

  const paginationCards = useCallback(
    async (e) => {
      let { indexEnd } = cardsPaginated;
      setCardsPaginated({
        cards: afterFilter.slice(0, indexEnd + 20),
        indexEnd:
          afterFilter.slice(0, indexEnd + 20).length > 0
            ? afterFilter.slice(0, indexEnd + 20).length - 1
            : 0,
      });
    },
    [afterFilter, cardsPaginated]
  );

  return (
    <div className='explore-nft content-list-nft'>
      <Row justify='start' gutter={[15, 20]} id='row-cards'>
        <BottomScrollListener onBottom={paginationCards} offset={300}>
          {!!cardsPaginated.cards ? (
            cardsPaginated.cards.map((token, index) => (
              <NFTsCard
                key={token.sellId}
                token={token}
                strSearch={!!strSearchInCollection ? strSearchInCollection : strSearch}
              />
            ))
          ) : (
            <></>
          )}
        </BottomScrollListener>
      </Row>
    </div>
  );
}
