Feature: LoginAccount
	In order to check login function with normal account
	As a User
	I want to login to system
@mytag
Scenario Outline: Login Account success or false
	Given User is at login page
	When User enter <username> and <password>
	And Click on Login button
	Then Success message will show if user login <success>
	Then User click logout if login <success>
Examples:
| username                      | password      | success |
| nghia.nguyenduc@axonactive.vn | Nghia@123		| true    |
| nghia.nguyenduc@axonactive.vn | WrongPassword | false   |

