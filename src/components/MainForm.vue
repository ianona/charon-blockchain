<template>
    <div>
        <div class='banner'>
            <a is="sui-label" color="teal" ribbon>
                Current address is: {{this.curAddress}}
            </a>
        </div>

        <div class='main' v-if='!validCharon'>
            <h3 is="sui-header">Create New Last Will</h3>
            <div class="ui info message">
                <div class="header">
                    Things to note when creating a last will:
                </div>
                <ul class="list">
                    <li>Your account will be charged eth for creating a last will & testament.</li>
                    <li>Default values will be used for your contract configuration. These can be changed afterwards.</li>
                </ul>
            </div>
            <sui-form>
                <sui-form-field width="ten">
                    <label>Estate Value (in wei)</label>
                    <input placeholder="100" v-model="weiValue" />
                    <sui-label v-if="this.cError" basic color="red" pointing>{{this.cError}}</sui-label>
                </sui-form-field>
                <sui-button @click.stop.prevent="createContract">Create Contract</sui-button>
            </sui-form>

            <sui-divider horizontal>Or</sui-divider>
            <h3 is="sui-header">Access Existing Will</h3>
            <sui-form>
                <sui-form-field width="ten">
                    <label>Contract Address</label>
                    <input placeholder="0xb33456B530DEF181D612Ae802603286b1ac720F9" v-model="contractAddress" />
                    <sui-label v-if="this.error" basic color="red" pointing>{{this.error}}</sui-label>
                </sui-form-field>
                <sui-button @click.stop.prevent="connectToWill">Acess Will</sui-button>
            </sui-form>
        </div>

        <div v-else>
            <h3 class="ui header">

                <div class="content">
                    Charon Contract Address: {{this.contractAddress}}
                    <sui-label v-if="benefactor.valid" color="green" horizontal>
                        Active
                    </sui-label>
                    <sui-label v-else color="red" horizontal>
                        Expired
                    </sui-label>
                    <sui-label v-if="benefactor.locked" color="grey" horizontal>
                        Locked
                    </sui-label>
                </div>
            </h3>

            <sui-button content="Return Home" icon="home" @click.stop.prevent="goHome" />

            <h4 is="sui-header">Last Will & Testament Summary</h4>
            <sui-list divided relaxed v-if="isOwner">
                <sui-list-item>
                    <sui-list-icon name="money" size="large" vertical-align="middle" />
                    <sui-list-content>
                        <a is="sui-list-header">Estate Value</a>
                        <a is="sui-list-description">{{this.benefactor.estate}}</a>
                    </sui-list-content>
                </sui-list-item>
                <sui-list-item>
                    <sui-list-icon name="users" size="large" vertical-align="middle" />
                    <sui-list-content>
                        <a is="sui-list-header">Beneficiaries</a>
                        <a is="sui-list-description" v-if="benefactor.beneficiaries.length > 0">
                            <sui-list bulleted v-for="b in benefactor.beneficiaries" :key="b">
                                <sui-list-item>{{b}}</sui-list-item>
                            </sui-list>

                        </a>
                        <a is="sui-list-description" v-else>
                            <sui-label color="red" horizontal>
                                No Beneficiaries Added
                            </sui-label>
                        </a>
                    </sui-list-content>
                </sui-list-item>
                <sui-list-item>
                    <sui-list-icon name="credit card outline" size="large" vertical-align="middle" />
                    <sui-list-content>
                        <a is="sui-list-header">Last Transaction</a>
                        <a is="sui-list-description">{{formatEpoch(benefactor.lastTx)}}</a>
                        <sui-button v-if="canUpdate" @click.stop.prevent="updateLife">Update Proof of Life</sui-button>
                    </sui-list-content>
                </sui-list-item>
                <sui-list-item>
                    <sui-list-icon name="key" size="large" vertical-align="middle" />
                    <sui-list-content>
                        <a is="sui-list-header">Activation Date</a>
                        <a is="sui-list-description">{{activationDate}}</a>
                    </sui-list-content>
                </sui-list-item>
            </sui-list>
            <sui-label v-else color="red" horizontal>
                Only Owner Can View This
            </sui-label>

            <h4 is="sui-header">Actions</h4>

            <sui-form v-if="isOwner">
                <!-- <sui-form-field width="eight">
      <label>Name</label>
      <input placeholder="Juan Dela Cruz" v-model="name"/>
    </sui-form-field> -->
                <sui-form-field inline>
                    <label>Add Beneficiary</label>
                    <sui-button @click.stop.prevent="addBeneficiary" size='mini' color='teal' icon="plus" :disabled="!beneficiary" />
                </sui-form-field>
                <sui-form-field width="eight">
                    <input placeholder="0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7" v-model='beneficiary' :disabled="benefactor.locked"/>

                    <!-- <div class="ui action input beneficiary" v-for="b in beneficiaries" :key='b.id'>
            <input placeholder="0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7" v-model='b.address'/>
            <sui-button @click.stop.prevent="removeBeneficiary(b.id)" color='red' icon="minus" ></sui-button>
        </div> -->
                </sui-form-field>
                <sui-form-field inline>
                    <label>Execute contract</label>
                    <input :disabled="!updateMode" type="number" placeholder="365" v-model="benefactor.daysToExecution" />
                    <label class="after">days after last transaction</label>
                </sui-form-field>
                <sui-form-field>
                    <sui-button v-if="!updateMode" @click.stop.prevent="updateMode = true" :disabled="benefactor.locked">Update Deadman's Switch</sui-button>
                    <sui-button v-if="updateMode" @click.stop.prevent="updateMode = false">Save Changes</sui-button>
                    <!-- <sui-checkbox label="Use " v-model='useSwitch'/> -->
                </sui-form-field>

                <!-- <sui-form-field v-if="updateMode" width="eight">
                    <label>Email</label>
                    <input type="text" placeholder="juandelacruz@gmail.com" />
                    <sui-message info>
                        You can choose to be notified via email <b>31 days</b> before your switch is set to execute the contract. You may choose to extend at any time.
                    </sui-message>
                </sui-form-field> -->
                <sui-form-field width="eight">
                    <label>Lock/Unlock Will</label>
                    <!-- <input placeholder="Juan Dela Cruz" v-model="name"/> -->
                    <sui-button v-if="!benefactor.locked" @click.stop.prevent="lockWill">Lock Will</sui-button>
                    <sui-button v-else @click.stop.prevent="unlockWill">Unlock Will</sui-button>
                </sui-form-field>
                <sui-form-field width="eight">
                    <label>Manual Execution</label>
                    <!-- <input placeholder="Juan Dela Cruz" v-model="name"/> -->
                    <sui-button @click.stop.prevent="executeWill">Execute Will</sui-button>
                </sui-form-field>
                <sui-form-field width="eight">
                    <label>Contract Termination</label>
                    <!-- <input placeholder="Juan Dela Cruz" v-model="name"/> -->
                    <sui-button color='red' @click.stop.prevent="cancelWill">Cancel Will</sui-button>
                </sui-form-field>
            </sui-form>
            <sui-label v-else color="red" horizontal>
                Only Owner Can Perform Actions
            </sui-label>

        </div>

        <sui-modal v-model="successModal">
            <sui-modal-header>Create Success!</sui-modal-header>
            <sui-modal-content>
                <sui-modal-description>
                    <sui-header>You may now access your contract at: {{contractAddress}}</sui-header>
                </sui-modal-description>
            </sui-modal-content>
            <sui-modal-actions>
                <sui-button positive @click.native="successModal=false">
                    OK
                </sui-button>
            </sui-modal-actions>
        </sui-modal>

        <sui-modal v-model="notifModal">
            <sui-modal-header>{{notifHeader}}</sui-modal-header>
            <sui-modal-content>
                <sui-modal-description>
                    <sui-header>{{notifMessage}}</sui-header>
                </sui-modal-description>
            </sui-modal-content>
            <sui-modal-actions>
                <sui-button positive @click.native="notifModal=false">
                    OK
                </sui-button>
            </sui-modal-actions>
        </sui-modal>
    </div>
</template>

<script>
const Web3 = require('web3');
import abi from './contractABI.js';
import bytecode from './bytecode.js';
const moment = require('moment')

export default {
    name: 'MainForm',
    props: {},
    data() {
        return {
            name: null,
            beneficiaries: [],
            beneficiary: null,
            useSwitch: false,
            count: 0,
            curAddress: null,
            contractAddress: '0x0f1d3b307c0f33910f9deff450282c249781e3da',
            web3: null,
            error: null,
            validCharon: false,
            isOwner: true,
            benefactor: {
                address: null,
                estate: null,
                beneficiaries: [],
                valid: null,
                lastTx: null,
                daysToExecution: null,
                locked: null,
            },
            updateMode: false,
            BenefactorContract: null,
            successModal: false,
            weiValue: null,
            cError: null,
            lastChecked: null,
            notifModal: false,
            notifHeader: null,
            notifMessage: null,
        }
    },
    created() {
        // this.startInterval()
    },
    computed: {
        activationDate: function () {
            return moment.unix(this.benefactor.lastTx).add(this.benefactor.daysToExecution, 'days').format('LL');
        },
        canUpdate: function () {
            return !moment.unix(this.benefactor.lastTx).isSame(moment(), 'day');
        }
    },
    async mounted() {
        if (window.ethereum) {
            // console.log("HERE")
            await window.ethereum.send('eth_requestAccounts');
            window.web3 = new Web3(window.ethereum);
            // console.log(window.web3)
            this.web3 = window.web3;
        } else {
            this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        }
        // console.log(this.web3);

        const accounts = await this.web3.eth.getAccounts();
        this.web3.eth.defaultAccount = accounts[0];
        this.curAddress = this.web3.eth.defaultAccount;

        if (this.$cookies.get("contract_address")) {
            this.contractAddress = this.$cookies.get("contract_address");
            this.connectToWill();
        }
        console.log(moment())
        // this.getTransactionsByAccount(this.curAddress)

        // 0xb33456B530DEF181D612Ae802603286b1ac720F9
    },
    methods: {
        goHome() {
            this.$cookies.remove("contract_address");
            this.BenefactorContract = null;
            this.validCharon = false;
            this.isOwner = true;
            this.error = null;
        },
        formatEpoch(epochDate) {
            return moment.unix(epochDate).format('LL');
        },
        updateLife() {
            this.BenefactorContract.methods.stillAlive().send().then((res) => {
                console.log(res)
                this.notifHeader = "Update Success!"
                this.notifMessage = "Kindly refresh page to reflect changes"
                this.notifModal = true;
            }).catch((e) => {
                console.log(e)
            });
        },
        lockWill() {
            this.BenefactorContract.methods.lockWill().send().then((res) => {
                console.log(res)
                this.notifHeader = "Lock Success!"
                this.notifMessage = "Kindly refresh page to reflect changes"
                this.notifModal = true;
            }).catch((e) => {
                console.log(e)
            });
        },
        unlockWill() {
            this.BenefactorContract.methods.unlockWill().send().then((res) => {
                console.log(res)
                this.notifHeader = "Unlock Success!"
                this.notifMessage = "Kindly refresh page to reflect changes"
                this.notifModal = true;
            }).catch((e) => {
                console.log(e)
            });
        },
        cancelWill() {
            this.BenefactorContract.methods.cancelWill().send().then((res) => {
                console.log(res)
                this.notifHeader = "Cancel Success!"
                this.notifMessage = "Kindly refresh page to reflect changes"
                this.notifModal = true;
            }).catch((e) => {
                console.log(e)
            });
        },
        addBeneficiary() {
            try {
                this.BenefactorContract.methods.addBeneficiary(this.beneficiary).send().then((res) => {
                    console.log(res)
                    this.notifHeader = "Add Beneficiary Success!"
                    this.notifMessage = "Kindly refresh page to reflect changes"
                    this.notifModal = true;
                    this.beneficiary = '';
                }).catch((e) => {
                    console.log(e)
                });
            } catch (err) {
                console.log(err)
            }

            // this.beneficiaries.push({
            //   id:this.beneficiaries.length+1,
            //   address:''
            // })
        },
        removeBeneficiary(id) {
            console.log(id)
            this.beneficiaries = this.beneficiaries.filter((b) => {
                return b.id != id;
            })
        },
        startInterval() {
            setInterval(() => {
                this.count++;
                console.log(this.count)
            }, 2000)
        },
        async createContract() {
            if (this.weiValue == null || this.weiValue == 0) {
                this.cError = 'Initial estate cannot be null or 0';
                return;
            }
            const dummy = await this.web3.eth.accounts.create()

            var BenefactorContract = new this.web3.eth.Contract(
                abi,
                dummy.address, {
                    // data:100,
                    from: this.web3.eth.defaultAccount,
                    // gasPrice:100000000000,
                    // gas:4712388
                }
            );
            console.log(BenefactorContract);

            BenefactorContract.deploy({
                    data: bytecode.object
                }).send({
                    from: this.curAddress,
                    value: this.weiValue,
                }, function (error, transactionHash) {
                    if (!error) console.log(transactionHash)
                })
                .on('error', function (error) {
                    console.log(error)
                })
                .on('transactionHash', function (transactionHash) {
                    console.log(transactionHash)
                })
                .on('receipt', function (receipt) {
                    console.log(receipt.contractAddress) // contains the new contract address
                })
                .on('confirmation', function (confirmationNumber, receipt) {
                    console.log(confirmationNumber)
                    console.log(receipt)
                })
                .then(function (newContractInstance) {
                    console.log(newContractInstance.options.address) // instance with the new contract address
                    this.contractAddress = newContractInstance.options.address;
                    this.successModal = true;
                });
        },
        connectToWill() {
            var BenefactorContract = null;
            try {
                BenefactorContract = new this.web3.eth.Contract(
                    abi,
                    this.contractAddress, {
                        from: this.web3.eth.defaultAccount,
                    }
                );
            } catch (err) {
                this.error = err.message
                console.log(err.message)
                return
            }

            this.BenefactorContract = BenefactorContract;

            // console.log(BenefactorContract);

            try {
                // BenefactorContract.methods.getBenefactor().call().then((res) => {
                //     console.log(res)
                //     if (res !== this.curAddress) {
                //         this.isOwner = false;
                //     }
                // }).catch(e => {
                //     console.log(e.message)
                //     if (e.message.includes('Only the benefactor can call this')) {
                //         this.isOwner = false;
                //     } else {
                //         this.error = "No Charon contract for this address"
                //         return
                //     }
                // })

                this.updateSummary();
            } catch (err) {
                this.error = err.message
                console.log(err.message)
                return
            }

            this.$cookies.set("contract_address", this.contractAddress, 60 * 60)
            this.validCharon = true
        },
        updateSummary() {
            // if (!this.isOwner) return;

            this.BenefactorContract.methods.getContractInfo().call().then((res) => {
                this.benefactor.locked = res[0];
                this.benefactor.valid = res[1];
            }).catch(e => {
                console.log(e.message)
                // if (e.message.includes('Only the benefactor can call this')) {
                //     this.isOwner = false;
                // } else {
                //     this.error = "No Charon contract for this address"
                //     return
                // }
            })

            this.BenefactorContract.methods.getSummary().call().then((res) => {
                // console.log(res)
                this.benefactor.address = res[0];
                if (this.benefactor.address !== this.curAddress) {
                    this.isOwner = false;
                    return;
                }
                this.benefactor.beneficiaries = res[1];
                this.benefactor.estate = res[2];
                this.benefactor.daysToExecution = res[3];
                this.benefactor.lastTx = res[4];

            }).catch(e => {
                console.log(e.message)
                if (e.message.includes('Only the benefactor can call this')) {
                    this.isOwner = false;
                } else {
                    this.error = "No Charon contract for this address"
                    return
                }
            })

            // this.BenefactorContract.methods.getEstate().call().then((res) => {
            //     this.benefactor.estate = res;
            // }).catch(e => {
            //     console.log(e.message)
            //     if (e.message.includes('Only the benefactor can call this')) {
            //         this.isOwner = false;
            //     } else {
            //         this.error = "No Charon contract for this address"
            //         return
            //     }
            // })

            // this.BenefactorContract.methods.getBeneficiaries().call().then((res) => {
            //     this.benefactor.beneficiaries = res;
            // }).catch(e => {
            //     console.log(e.message)
            //     if (e.message.includes('Only the benefactor can call this')) {
            //         this.isOwner = false;
            //     } else {
            //         this.error = "No Charon contract for this address"
            //         return
            //     }
            // })
        },
        checkExecution() {

        },
        executeWill() {
            this.BenefactorContract.methods.manualExecute().send().then((res) => {
                console.log(res)
                this.notifHeader = "Execute Success!"
                this.notifMessage = "Kindly refresh page to reflect changes"
                this.notifModal = true;
            }).catch((e) => {
                console.log(e)
            });
        },
        async getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
            var eth = this.web3.eth;
            if (endBlockNumber == null) {
                let endBlock = await eth.getBlock();
                while (endBlock === null) {
                    endBlock = await eth.getBlock();
                }
                console.log(endBlock)
                endBlockNumber = endBlock.number;
                console.log("Using endBlockNumber: " + endBlockNumber);
            }
            if (startBlockNumber == null) {
                startBlockNumber = endBlockNumber - 1000;
                console.log("Using startBlockNumber: " + startBlockNumber);
            }
            console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks " + startBlockNumber + " and " + endBlockNumber);

            for (var i = startBlockNumber; i <= endBlockNumber; i++) {
                if (i % 1000 == 0) {
                    console.log("Searching block " + i);
                }
                var block = eth.getBlock(i, true);
                if (block != null && block.transactions != null) {
                    block.transactions.forEach(function (e) {
                        if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
                            console.log("  tx hash          : " + e.hash + "\n" +
                                "   nonce           : " + e.nonce + "\n" +
                                "   blockHash       : " + e.blockHash + "\n" +
                                "   blockNumber     : " + e.blockNumber + "\n" +
                                "   transactionIndex: " + e.transactionIndex + "\n" +
                                "   from            : " + e.from + "\n" +
                                "   to              : " + e.to + "\n" +
                                "   value           : " + e.value + "\n" +
                                "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n" +
                                "   gasPrice        : " + e.gasPrice + "\n" +
                                "   gas             : " + e.gas + "\n" +
                                "   input           : " + e.input);
                        }
                    })
                }
            }
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
div.banner {
    margin-bottom: 2em;
}

div.beneficiary {
    margin-top: .7em;
}

label.after {
    padding-left: .7em;
}
</style>
