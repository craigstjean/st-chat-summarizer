package sillytavern

import "craigstjean.com/stsummarizer/internal/config"

type SillyTavernService struct {
	dataPath       string
	chatsPath      string
	groupsPath     string
	groupChatsPath string
	backupsPath    string
	defaultUser    string
}

func NewService() *SillyTavernService {
	return &SillyTavernService{
		dataPath:       config.GetSTDataPath(),
		chatsPath:      config.STChatsPath,
		groupsPath:     config.STGroupsPath,
		groupChatsPath: config.STGroupChatsPath,
		backupsPath:    config.STBackupsPath,
		defaultUser:    config.STDefaultUser,
	}
}
