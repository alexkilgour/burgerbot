'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var request = require('request');
var Bot = require('slackbots');
var cheerio = require('cheerio');
// var scraper = express();

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "burgerbot")
 *
 * @param {object} settings
 * @constructor
 */
var BurgerBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'burgerbot';
    this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(BurgerBot, Bot);

/**
 * Run the bot
 * @public
 */
BurgerBot.prototype.run = function () {
    BurgerBot.super_.call(this, this.settings);
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
BurgerBot.prototype._onStart = function () {
    this._loadBotUser();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
BurgerBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromBurgerBot(message) &&
        this._isMentioningHonestBurger(message)
    ) {
        this._replyWithLatestSpecial(message);
    }
};

/**
 * Replyes to a message with the latest special
 * @param {object} originalMessage
 * @private
 */
BurgerBot.prototype._replyWithLatestSpecial = function (originalMessage) {
    var self = this;
    var channel = self._getChannelById(originalMessage.channel);
    var message = self._getBurgerDetails();
    self.postMessageToChannel(channel.name, message, {as_user: true});
};

/**
 * Loads the user object representing the bot
 * @private
 */
BurgerBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
BurgerBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
BurgerBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C'
        ;
};

/**
 * Util function to check if a given real time message is mentioning `Honest Special` or the burgerbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
BurgerBot.prototype._isMentioningHonestBurger = function (message) {
    return message.text.toLowerCase().indexOf('honest special') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

/**
 * Util function to check if a given real time message has ben sent by the burgerbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
BurgerBot.prototype._isFromBurgerBot = function (message) {
    return message.user === this.user.id;
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
BurgerBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

/**
 * Scrape the honest burger website and find out the burger details
 * @returns {Object}
 * @private
 */
BurgerBot.prototype._getBurgerDetails = function () {
    var url = 'http://www.honestburgers.co.uk/';
    var errormsg = 'Sorry, I couldn\'t find the current special burger :-(';
    var message = request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var title, description, image;

            $('#main > .latest-news').filter(function(){
                var data = $(this);
                title = data.find('a > .news_span').text();
                description = data.find('a > p').clone().children().remove().end().text();
                image = data.find('a > img').attr('src');
            });

            return title + '\n' + description + '\n' + image;
        }

        return errormsg;
    });

    return message;
};

module.exports = BurgerBot;
