import Sell from 'Components/Sell';
import Buy from 'Components/Buy';
import Cancel from 'Components/Cancel';
import Transfer from 'Components/Transfer';
import UpdatePrice from 'Components/UpdatePrice';
import { setBalance, setMomaBalance } from 'store/actions';
import store from 'store/index';
import useInterval from 'utils/useInterval';
import { useSelector } from 'react-redux';

export default function RenderSwitch({
  status,
  token,
  orderDetail,
  is1155,
  available,
  web3,
  getOwners1155,
  addressToken,
  id,
  chainId,
  sellID,
}) {
  const { walletAddress } = useSelector((state) => state);

  useInterval(() => {
    if (!!walletAddress) {
      store.dispatch(setBalance(walletAddress));
      store.dispatch(setMomaBalance(walletAddress));
    }
  }, 3000);

  switch (status) {
    case 3:
      return (
        <div className='PE'>
          <div className='actions-btn'>
            <UpdatePrice
              orderDetail={orderDetail}
              token={token}
              is1155={is1155}
              available={available}
              getOwners1155={getOwners1155}
            />
            <div className='cAFwWB' />
            <Cancel orderDetail={orderDetail} getOwners1155={getOwners1155} chainId={chainId} />
          </div>
        </div>
      );
    case 2:
      return (
        <div className='PE'>
          <div className='actions-btn'>
            <Sell
              token={token}
              is1155={is1155}
              available={available}
              getOwners1155={getOwners1155}
            />
            <div className='cAFwWB' />
            <Transfer
              token={token}
              is1155={is1155}
              available={available}
              web3={web3}
              getOwners1155={getOwners1155}
            />
          </div>
        </div>
      );
    case 1:
      return (
        <Buy
          orderDetail={orderDetail}
          is1155={is1155}
          id={id}
          addressToken={addressToken}
          getOwners1155={getOwners1155}
        />
      );
    default:
      return <div></div>;
  }
}
