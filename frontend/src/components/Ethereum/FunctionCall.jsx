import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { Contract , ethers } from 'ethers'; 

// Fetch the ABI once and store it in a state
// const fetchAbi = async () => {
//   const response = await fetch('/near-multichain/abi.json');
//   const x = await response.json();
//   return x;

// };

const abi = [{"inputs":[{"internalType":"address","name":"dao","type":"address"},{"internalType":"address","name":"where","type":"address"},{"internalType":"address","name":"who","type":"address"},{"internalType":"bytes32","name":"permissionId","type":"bytes32"}],"name":"DaoUnauthorized","type":"error"},{"inputs":[{"internalType":"uint64","name":"limit","type":"uint64"},{"internalType":"uint64","name":"actual","type":"uint64"}],"name":"DateOutOfBounds","type":"error"},{"inputs":[{"internalType":"uint64","name":"limit","type":"uint64"},{"internalType":"uint64","name":"actual","type":"uint64"}],"name":"MinDurationOutOfBounds","type":"error"},{"inputs":[],"name":"NoVotingPower","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ProposalCreationForbidden","type":"error"},{"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"ProposalExecutionForbidden","type":"error"},{"inputs":[{"internalType":"uint256","name":"limit","type":"uint256"},{"internalType":"uint256","name":"actual","type":"uint256"}],"name":"RatioOutOfBounds","type":"error"},{"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"},{"internalType":"address","name":"account","type":"address"},{"internalType":"enum IMajorityVoting.VoteOption","name":"voteOption","type":"uint8"}],"name":"VoteCastForbidden","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address[]","name":"members","type":"address[]"}],"name":"MembersAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address[]","name":"members","type":"address[]"}],"name":"MembersRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"definingContract","type":"address"}],"name":"MembershipContractAnnounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint64","name":"startDate","type":"uint64"},{"indexed":false,"internalType":"uint64","name":"endDate","type":"uint64"},{"indexed":false,"internalType":"bytes","name":"metadata","type":"bytes"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"indexed":false,"internalType":"struct IDAO.Action[]","name":"actions","type":"tuple[]"},{"indexed":false,"internalType":"uint256","name":"allowFailureMap","type":"uint256"}],"name":"ProposalCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"ProposalExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":true,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"enum IMajorityVoting.VoteOption","name":"voteOption","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"votingPower","type":"uint256"}],"name":"VoteCast","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum MajorityVotingBase.VotingMode","name":"votingMode","type":"uint8"},{"indexed":false,"internalType":"uint32","name":"supportThreshold","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"minParticipation","type":"uint32"},{"indexed":false,"internalType":"uint64","name":"minDuration","type":"uint64"},{"indexed":false,"internalType":"uint256","name":"minProposerVotingPower","type":"uint256"}],"name":"VotingSettingsUpdated","type":"event"},{"inputs":[],"name":"UPDATE_VOTING_SETTINGS_PERMISSION_ID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"UPGRADE_PLUGIN_PERMISSION_ID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"canExecute","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"},{"internalType":"address","name":"_voter","type":"address"},{"internalType":"enum IMajorityVoting.VoteOption","name":"_voteOption","type":"uint8"}],"name":"canVote","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_metadata","type":"bytes"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct IDAO.Action[]","name":"_actions","type":"tuple[]"},{"internalType":"uint256","name":"_allowFailureMap","type":"uint256"},{"internalType":"uint64","name":"_startDate","type":"uint64"},{"internalType":"uint64","name":"_endDate","type":"uint64"},{"internalType":"enum IMajorityVoting.VoteOption","name":"_voteOption","type":"uint8"},{"internalType":"bool","name":"_tryEarlyExecution","type":"bool"}],"name":"createProposal","outputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"dao","outputs":[{"internalType":"contract IDAO","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"execute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"getProposal","outputs":[{"internalType":"bool","name":"open","type":"bool"},{"internalType":"bool","name":"executed","type":"bool"},{"components":[{"internalType":"enum MajorityVotingBase.VotingMode","name":"votingMode","type":"uint8"},{"internalType":"uint32","name":"supportThreshold","type":"uint32"},{"internalType":"uint64","name":"startDate","type":"uint64"},{"internalType":"uint64","name":"endDate","type":"uint64"},{"internalType":"uint64","name":"snapshotBlock","type":"uint64"},{"internalType":"uint256","name":"minVotingPower","type":"uint256"}],"internalType":"struct MajorityVotingBase.ProposalParameters","name":"parameters","type":"tuple"},{"components":[{"internalType":"uint256","name":"abstain","type":"uint256"},{"internalType":"uint256","name":"yes","type":"uint256"},{"internalType":"uint256","name":"no","type":"uint256"}],"internalType":"struct MajorityVotingBase.Tally","name":"tally","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct IDAO.Action[]","name":"actions","type":"tuple[]"},{"internalType":"uint256","name":"allowFailureMap","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"},{"internalType":"address","name":"_voter","type":"address"}],"name":"getVoteOption","outputs":[{"internalType":"enum IMajorityVoting.VoteOption","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVotingToken","outputs":[{"internalType":"contract IVotesUpgradeable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IDAO","name":"_dao","type":"address"},{"components":[{"internalType":"enum MajorityVotingBase.VotingMode","name":"votingMode","type":"uint8"},{"internalType":"uint32","name":"supportThreshold","type":"uint32"},{"internalType":"uint32","name":"minParticipation","type":"uint32"},{"internalType":"uint64","name":"minDuration","type":"uint64"},{"internalType":"uint256","name":"minProposerVotingPower","type":"uint256"}],"internalType":"struct MajorityVotingBase.VotingSettings","name":"_votingSettings","type":"tuple"},{"internalType":"contract IVotesUpgradeable","name":"_token","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isMember","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"isMinParticipationReached","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"isSupportThresholdReached","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"isSupportThresholdReachedEarly","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minDuration","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minParticipation","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minProposerVotingPower","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pluginType","outputs":[{"internalType":"enum IPlugin.PluginType","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"proposalCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proxiableUUID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"supportThreshold","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"_interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_blockNumber","type":"uint256"}],"name":"totalVotingPower","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"enum MajorityVotingBase.VotingMode","name":"votingMode","type":"uint8"},{"internalType":"uint32","name":"supportThreshold","type":"uint32"},{"internalType":"uint32","name":"minParticipation","type":"uint32"},{"internalType":"uint64","name":"minDuration","type":"uint64"},{"internalType":"uint256","name":"minProposerVotingPower","type":"uint256"}],"internalType":"struct MajorityVotingBase.VotingSettings","name":"_votingSettings","type":"tuple"}],"name":"updateVotingSettings","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"},{"internalType":"enum IMajorityVoting.VoteOption","name":"_voteOption","type":"uint8"},{"internalType":"bool","name":"_tryEarlyExecution","type":"bool"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"votingMode","outputs":[{"internalType":"enum MajorityVotingBase.VotingMode","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]

// const targetAddress = "TARGET_CONTRACT_ADDRESS"; // Address of the contract to call
// const value = 0; // Amount of ETH to send (0 in this case)

// // Encode the function call for the joke proposal
// const iface = new ethers.Interface(["function transferOwnership(address newOwner)"]);
// const calldata1 = iface.encodeFunctionData("transferOwnership", ["0x1234567890123456789012345678901234567890"]);
// console.log(calldata1);

// const iface2 = new ethers.Interface(["function transfer(address to, uint256 amount)"]);
// const calldata2 = iface2.encodeFunctionData("transfer", ["0x9876543210987654321098765432109876543210", ethers.parseUnits("50", 6)]);

// // Proposal parameters
// const target1 = ["0x8c00B9D18C7eDdb48620bB292BE2Dac7A635C59E"];
// const value1 = [0];
// const target2 = ["0x8c00B9D18C7eDdb48620bB292BE2Dac7A635C59E"];
// const value2 = [50];
// const calldata11 = [calldata1];
// const description1 = "Make X owner ";
// const calldata22 = [calldata2];
// const description2 = "pay 50 USDT to someone";

// const proposal1 = [target1, value1, null, description1];
// const proposal2 = [target2, value2, calldata22, description2];

const governorAddressDefault = "0xE90927DC319EB55595Bd1bed910633dD6c251484"; 

const ipfs_metadata = "ipfs://bafkreidbtzbtfjsjfavu4pdnrqnendqcuk56ph2f2qsioz4imzeu7b3mtu/"
//METADATA URL TO BYTES
const example_metadata = "0x697066733a2f2f6261666b7265696266796c69677561756a6a75336332743664626873366d7036727077336361756d646235616c7366713776626334687878796834"


const proposalPayload = [example_metadata, [], 0, 0, 0, 0, false];

//proposalId , _voteOption, false
const votePayload = [2,2,false];

export const FunctionCallForm = forwardRef(({ props: { Eth, senderAddress, loading } }, ref) => {
  const [governorAddress, setGovernorAddress] = useState(governorAddressDefault);
  const [proposals, setProposals] = useState([{
    id: 1,
    description: 'Give 500 TATE to a random guy John',
    status: 'open',
  },
  {
    id: 1,
    description: 'Make Andrew Tate President',
    status: 'open',
  },

]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [proposalId, setProposalId] = useState('');
  useEffect(() => {
    async function handleCalls(){
      //go through the history of events and show proposals created
      console.log('handle')
      const contract = new Contract(governorAddress, abi, Eth.provider);
      const events = await contract.queryFilter('ProposalCreated');
      console.log(events)

      events.forEach(async (event) => {
  
        console.log(event.args)
      });
    }
    handleCalls();

  }, []);

  // async function getName() {
  //   if (abi) {
  //     const result = await Eth.getContractViewFunction(governorAddress, abi, 'name');
  //     return result;
  //   } else {
  //       console.log('abi not found')
  //   }
  //     //  const contract = new Contract(governorAddress, abi, Eth.provider);
  //   // console.log(await contract["name"].call())

  async function createProposal() {
    //Encode the function call for the proposal
    const data = Eth.createTransactionData(governorAddress, abi, 'createProposal', proposalPayload);
    const { transaction, payload } = await Eth.createPayload(senderAddress, governorAddress, 0, data);
    return { transaction, payload };
    }

  async function vote(str){
    if(str === "yes"){
      votePayload[1] = 2;
    } else if(str === "no"){
      votePayload[1] = 3;
    } else if(str === "abstain"){
      votePayload[1] = 1;
    }
    const data = Eth.createTransactionData(governorAddress, abi, 'vote', votePayload);
    const { transaction, payload } = await Eth.createPayload(senderAddress, governorAddress, 0, data);
    return { transaction, payload };
  }

  useImperativeHandle(ref, () => ({
    async createPayload() {
      return vote("yes");
    },

    async afterRelay() {
      // getNumber();
      // getProposals();
    }
  }));

  return (
    <>
      <div className="row mb-3">
        <label className="col-sm-2 col-form-label col-form-label-sm">Contract:</label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control form-control-sm"
            value={governorAddress}
            onChange={(e) => governorAddress(e.target.value)}
          />
            <p>Name : {name}</p>
          <div className="form-text">Contract address</div>
        </div>
      </div>
      {/* <div className="row mb-3">
        <label className="col-sm-2 col-form-label col-form-label-sm">Proposal Description:</label>
        <div className="col-sm-10">
          
          <button onClick={createProposal} disabled={loading}>Propose</button>
        </div>
      </div> */}
      {/* <div className="row mb-3">
        <label className="col-sm-2 col-form-label col-form-label-sm">Proposal Description:</label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control form-control-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <button onClick={createProposal} disabled={loading}>Propose</button>
        </div>
      </div> */}
      <div className="row mb-3">
        <label className="col-sm-2 col-form-label col-form-label-sm">Proposals:</label>
        {
          proposals.map((proposal) => (
            <div className="col-sm-10" key={proposal.id}>
              <ul>
                <li>{proposal.description}</li>
              </ul>
            </div>
          ))
        }
        <div className="col-sm-10">
          <ul>
                <button onClick={() => vote("yes")} disabled={loading}>Yes</button>
                <button onClick={() => vote("no")} disabled={loading}>No</button>
                <button onClick={() => vote("abstain")} disabled={loading}>Abstain</button>
          </ul>
        </div>
      </div>
    </>
  );
});

FunctionCallForm.propTypes = {
  props: PropTypes.shape({
    senderAddress: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    Eth: PropTypes.shape({
      createPayload: PropTypes.func.isRequired,
      createTransactionData: PropTypes.func.isRequired,
      getContractViewFunction: PropTypes.func.isRequired,
      provider: PropTypes.object.isRequired, // Add this line
    }).isRequired,
  }).isRequired,
};

FunctionCallForm.displayName = 'EthereumContractView';
