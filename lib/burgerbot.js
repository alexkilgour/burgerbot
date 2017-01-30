'use strict';

var request = require('request');
var Bot = require('slackbots');
var cheerio = require('cheerio');

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "burgerbot")
 *
 * @param {object} settings
 * @constructor
 */
class BurgerBot extends Bot {
    constructor(settings) {
        settings.name = settings.name || 'burgerbot';
        settings.user = null;
        super(settings);
    }
};

/**
 * Run the bot
 * @public
 */
BurgerBot.prototype.run = function () {
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
    var url = 'http://www.honestburgers.co.uk/';
    var errorMsg = 'Sorry, I couldn\'t find the current special burger :-(';
    var channel = self._getChannelById(originalMessage.channel);

    self._getBurgerDetails(url, errorMsg, function(msg) {
        if (channel.is_group) {
            self.postMessageToGroup(channel.name, msg, {as_user: true});
        }
        else {
            self.postMessageToChannel(channel.name, msg, {as_user: true});
        }
    });
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
        (message.channel[0] === 'C' ||
        message.channel[0] === 'G');
};

/**
 * Util function to check if a given real time message is mentioning `Honest Special` or the burgerbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
BurgerBot.prototype._isMentioningHonestBurger = function (message) {
    return message.text && (message.text.toLowerCase().indexOf('honest special') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1 ||
        message.text.toLowerCase().indexOf('<@' + this.user.id.toLowerCase() + '>') > -1);
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
 * Util function to get the name of a channel (public or private) given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
BurgerBot.prototype._getChannelById = function (channelId) {
    var allChannels = this.channels.concat(this.groups);
    return allChannels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

/**
 * Scrape the honest burger website and find out the burger details
 * @returns {String}
 * @private
 */
BurgerBot.prototype._getBurgerDetails = function (url, errorMsg, callback) {
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var title, description, image;

            $('#main > .latest-news').filter(function(){
                var data = $(this);
                title = data.find('a > .news_span').text();
                description = data.find('a > p').clone().children().remove().end().text().trim();
                image = data.find('a > img').attr('src');
            });

            callback('*' + title + '*\n' + description + '\n' + image);
        }
        else {
            callback(errorMsg);
        }
    });
};

module.exports = BurgerBot;
