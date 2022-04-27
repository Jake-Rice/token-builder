import Modal from 'react-bootstrap/Modal';
import ModalBody from "react-bootstrap/ModalBody";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalFooter from "react-bootstrap/ModalFooter";
import ModalTitle from "react-bootstrap/ModalTitle";
import Accordion from "react-bootstrap/Accordion";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import AccordionBody from "react-bootstrap/AccordionBody";
import Button from "react-bootstrap/Button";

const HelpModal = (props) => {
  const hideHelpModal = () => {
    props.toggleModal(false);
  }

  return (
    <Modal show={props.showModal} onHide={hideHelpModal} className="instructions-container card-info">
      <ModalHeader>
        <ModalTitle>Instructions</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Accordion flush>
          <AccordionItem eventKey="0">
            <AccordionHeader className="instructions-section-header">Creating A Token</AccordionHeader>
            <AccordionBody>
              <ol className="instructions-list">
                <li>Make sure you have Metamask installed on your browser.</li>
                <li>Set Metamask to the Rinkeby Ethereum Test Network.</li>
                <li>Get some test ETH from a faucet like <a href="http://faucets.chain.link/rinkeby" target="_blank">Chainlink</a></li>
                <li>Connect your Metamask account to this website.</li>
                <li>Click the "Create A Token" button.</li>
                <li>Enter the Name, Symbol and Initial Supply of your token.</li>
                <li>Enter the number of decimal places your token can be divided into.</li>
                <li>Click the "Create Token" button at the bottom of the form.</li>
                <li>Approve the transaction in Metamask to pay the fee and gas for token deployment.</li>
              </ol>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="1">
            <AccordionHeader className="instructions-section-header">Using The Token Dashboard</AccordionHeader>
            <AccordionBody>
              <ol className="instructions-list">
                <li>Make sure you have Metamask installed on your browser.</li>
                <li>Click the "Token Dashboard" button above.</li>
                <li>Enter the contract address for the ERC20 token you want to use.</li>
                <li>Click the "Get Token" button.</li>
                <li>If the address points to a valid ERC20 token, the token details will appear.</li>
              </ol>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="2">
            <AccordionHeader className="instructions-function-header">Transfer Tokens</AccordionHeader>
            <AccordionBody>
              <ol className="instructions-list">
                <li>Enter Recipient (the address you are sending your tokens to).</li>
                <li>Enter Amount (the number of tokens you are sending to the Recipient).</li>
                <li>Click the "Transfer" button.</li>
                <li>Approve the transaction in Metamask and pay the necessary gas.</li>
                <li>Your balance shown in the dashboard will update once the transaction is added to the blockchain.</li>
              </ol>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="3">
            <AccordionHeader className="instructions-function-header">Set Token Allowance</AccordionHeader>
            <AccordionBody> 
              <ol className="instructions-list">
                <li>This function allows another address to spend your tokens (or transfer the tokens to their own address).</li>
                <li>Enter Spender (the address you are authorizing to spend your tokens).</li>
                <li>Enter Amount (the number of tokens you are authorizing the Spender to spend).</li>
                <li>Click the "Set Allowance" button.</li>
                <li>Approve the transaction in Metamask and pay the necessary gas.</li>
                <li>Once the transaction is added to the blockchain, the Spender address will have access to the approved Amount of your tokens.</li>
              </ol>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="4">
            <AccordionHeader className="instructions-function-header">Claim Allowance</AccordionHeader>
            <AccordionBody>
              <ol className="instructions-list">
                <li>This function transfers tokens to your account from an address that has approved an allowance to you.</li>
                <li>Enter Owner (the address you are claiming tokens from).</li>
                <li>If the address is valid, the allowance the Owner has approved for your address will be shown.</li>
                <li>Enter Amount (the number of tokens you are claiming).</li>
                <li>Click the "Claim Allowance" button.</li>
                <li>Approve the transaction in Metamask and pay the necessary gas.</li>
                <li>Once the transaction is added to the blockchain, the tokens will be in your account, and the allowance from the Owner will be reduced</li>
              </ol>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={hideHelpModal}>OK</Button>
      </ModalFooter>
    </Modal>
  )
}

export default HelpModal;