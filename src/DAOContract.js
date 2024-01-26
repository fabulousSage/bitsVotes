// src/DAOContract.js
import getWeb3 from './getWeb3';
import DAOContractABI from './DAOContractABI.json';

const getDAOContract = async () => {
  try {
    const web3 = await getWeb3();
    const address = '0x2b048b7f17BeEB8133c31C3ed52CfBA11804A7E9';
    const daoContract = new web3.eth.Contract(DAOContractABI, address);
    return daoContract;
  } catch (error) {
    console.error('Failed to get DAO Contract:', error);
    throw error; // Throwing error to be handled by caller
  }
};

export default getDAOContract;
