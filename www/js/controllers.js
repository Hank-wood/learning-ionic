angular.module('starter.controllers', ['starter.factory', 'hljs', 'starter.utils'])

	.config(function (hljsServiceProvider) {
	hljsServiceProvider.setOptions({
		// replace tab with 4 spaces
		tabReplace: '    '
	});
})

.controller('LevelSelectCtrl', function($scope) {
  $scope.levels = [
    { title: 'Level 1', id: 1 },
    { title: 'Level 2', id: 2 },
    { title: 'Level 3', id: 3 },
    { title: 'Level 4', id: 4 }
  ];
})

.controller('QuizCtrl', function($scope, $stateParams, $http, quizFactory, utilsFactory) {
	$scope.level = $stateParams.level;
	$http.get('assets/data/lv' + $stateParams.level + '.json').then(function(data) {
		$scope.level_langeuages = data.data;
	});

	$scope.start = function() {
		$scope.id = 0;
		//$scope.quizOver = true;
		$scope.inProgress = true;
		$scope.getQuestion();
	};

	$scope.reset = function() {
		$scope.inProgress = false;
		$scope.score = 0;
	};

	$scope.getQuestion = function() {
		var language_id = utilsFactory.getRandomInt($scope.level_langeuages.length);
		var correct_language = $scope.level_langeuages[language_id].language;

		quizFactory.myService.async('lv' + $scope.level, correct_language).then(function(data) {
			$scope.data = data;
		}).then(function(){
			var firstLanguage_id = utilsFactory.getRandomIntWithout($scope.level_langeuages.length, language_id);
			var firstLanguage = $scope.level_langeuages[firstLanguage_id].language;
			var secondLanguage_id = utilsFactory.getRandomIntWithoutArray($scope.level_langeuages.length, [firstLanguage_id, language_id]);
			var secondLanguage = $scope.level_langeuages[secondLanguage_id].language;

			var options_language = utilsFactory.shuffle([firstLanguage.split('.')[0], correct_language.split('.')[0], secondLanguage.split('.')[0]]);
			$scope.answer = -1;
			angular.forEach(options_language, function(language, index){
				if(language === correct_language.split('.')[0]) {
					$scope.answer = index;
				}
			});
			var q = {
				question: $scope.data,
				options: options_language,
				answer: $scope.answer
			};
			if(q) {
				$scope.question = q.question;
				$scope.options = q.options;
				$scope.answer = q.answer;
				$scope.answerMode = true;
				$scope.wiki_url = 'lv' + $stateParams.level + '+' + correct_language;
				$scope.correct_language = correct_language;
			} else {
				$scope.quizOver = true;
			}
		});
	};

	$scope.checkAnswer = function() {
		if(!$('input[name=answer]:checked').length) return;
		var ans = $('input[name=answer]:checked').val();
		if(ans == $scope.options[$scope.answer]) {
			$scope.score++;
			$scope.correctAns = true;
		} else {
			$scope.correctAns = false;
		}

		$scope.answerMode = false;
	};

	$scope.nextQuestion = function() {
		$scope.id++;
		$scope.getQuestion();
	};

	$scope.reset();
})

.controller('WikiCtrl', function($scope, $stateParams, $http, utilsFactory) {
	$scope.level = $stateParams.level;
	$http.get('assets/data/results.json').then(function(data) {
		var results = [];
		angular.forEach(data.data, function(each_level){
			angular.forEach(each_level, function(each_language){
				var language =each_language.language.split('.')[0];
				angular.extend(each_language, {'language_name': language});
				results.push(each_language)
			});
		});
		$scope.languages = results;
	});
})

.controller('WikiDetailCtrl', function($scope, $stateParams, quizFactory, $http, utilsFactory) {
	var language_info = $stateParams.language_info.split("+"),
	level = language_info[0],
	file_name = language_info[1],
	language =file_name.split('.')[0];

	$scope.language = language;
	$scope.md ='assets/intro/' + language + '.md';

	$http.get('assets/'+  level + '/' + file_name).then(function(data) {
		$scope.hello_world = data.data;
	});
});