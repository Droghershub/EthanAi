Feature: Summary Card
	In order to validate Summary card
	As a User
	I want to be show or hide many session when click on summary card
@mytag
Scenario Outline: Show and Hide Summary Card
	Given I am at home page
	When I click on <card>
	Then System will show <card_session>
	And I scroll to top
	Then system will hide <card_session>
	When I click on <card>
	Then Session <card_session> will be show again
Examples:
| card         | card_session         |
| asavings     | div_SavingRate       |
| aretirement  | div_LifeStyle        |
| ainvestments | div_Investment       |
| ailliquid    | div_IlliquidAsset    |
| aaproperty   | div_PropertyPurchase |
| aeducation   | div_Education        |
