// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import getDAOContract from './DAOContract';
import './App.css';

function App() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [daoContract, setDaoContract] = useState(null);

  const fetchProposals = useCallback(async () => {
    if (!daoContract) return;

    setLoading(true);
    try {
      const proposalCount = await daoContract.methods.proposalCount().call();
      const fetchedProposals = [];
      for (let i = 1; i <= proposalCount; i++) {
        const proposal = await daoContract.methods.proposals(i).call();
        const votePercentage = await daoContract.methods.getVotePercentage(i).call();
        fetchedProposals.push({ id: i, ...proposal, votePercentage });
      }
      setProposals(fetchedProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
    setLoading(false);
  }, [daoContract]);

  useEffect(() => {
    const init = async () => {
      try {
        const contract = await getDAOContract();
        setDaoContract(contract);
        fetchProposals(); // Fetch proposals on component mount
      } catch (error) {
        console.error('Error initializing DAO Contract:', error);
      }
    };
    init();
  }, [fetchProposals]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        if (daoContract) {
          fetchProposals();
        }
        console.log('Wallet connected:', accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error.message);
        alert("Failed to connect wallet: " + error.message);
      }
    } else {
      alert("Ethereum wallet is not available. Please install MetaMask or use a compatible browser.");
    }
  };

  const voteOnProposal = async (proposalId) => {
    if (!daoContract || !account) return;

    setLoading(true);
    try {
      await daoContract.methods.voteOnProposal(proposalId).send({ from: account });
      fetchProposals(); // Refresh proposals after voting
    } catch (error) {
      console.error('Error voting on proposal:', error);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h1>DAO Voting System</h1>

      {!account && (
        <button className="connect-wallet-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      {loading && <p>Loading...</p>}

      <div className="proposals-list">
        <h2>Proposals</h2>
        {proposals.map(proposal => (
          <div className="proposal-item" key={proposal.id}>
            <p>{proposal.description} - Votes: {proposal.voteCount}</p>
            <p>Vote Percentage: {proposal.votePercentage}%</p>
            {account && !proposal.executed && (
              <button className="vote-btn" onClick={() => voteOnProposal(proposal.id)}>
                Vote
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
